import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl, AsyncValidatorFn, FormBuilder,
  FormGroup, ValidationErrors, Validators
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  freelancerForm!: FormGroup;
  otpForm!: FormGroup;

  // Step control
  otpStage: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';
  infoMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  // OTP
  maskedEmail: string = '';
  otpTimer: number = 0;
  private timerInterval: any;
  private pendingFormData: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.freelancerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern('^[a-zA-Z0-9_]+$')
      ],
        [this.usernameValidator()]
      ],
      email: ['', [
        Validators.required,
        Validators.email
      ],
        [this.emailValidator()]
      ],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]+$')
      ]],
      role: ['', Validators.required],
      contactNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      skills: [''],
      bio: ['', [Validators.maxLength(500)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  // ─── Async Validators ───
  usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 3) return of(null);
      return timer(500).pipe(
        switchMap(() => this.authService.checkUsername(control.value)),
        map(res => res.exists ? { usernameTaken: true } : null),
        catchError(() => of(null))
      );
    };
  }

  emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || !control.value.includes('@')) return of(null);
      return timer(500).pipe(
        switchMap(() => this.authService.checkEmail(control.value)),
        map(res => res.exists ? { emailTaken: true } : null),
        catchError(() => of(null))
      );
    };
  }

  // ─── STEP 1: Validate + Send OTP ───
  onSubmit(): void {
    if (this.freelancerForm.invalid) {
      this.freelancerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';
    this.successMessage = '';

    this.pendingFormData = this.freelancerForm.value;

    this.authService.registerSendOtp(this.pendingFormData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.otpStage = true;
        this.maskedEmail = res?.email || '';
        this.infoMessage = this.maskedEmail
          ? `OTP sent to ${this.maskedEmail}`
          : 'OTP has been sent to your email.';
        this.otpForm.get('otp')?.reset();
        this.startTimer(300);
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err?.status === 409) {
          this.errorMessage = err?.error?.message || 'Username or email already taken.';
        } else if (err?.status === 0) {
          this.errorMessage = 'Server not reachable.';
        } else {
          this.errorMessage = err?.error?.message || 'Registration failed. Try again.';
        }
      }
    });
  }

  // ─── STEP 2: Verify OTP + Create Account ───
  verifyOtp(): void {
    if (this.otpForm.invalid || !this.pendingFormData) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    const otp = this.otpForm.get('otp')?.value;

    this.authService.registerVerifyOtp(this.pendingFormData, otp).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.clearTimer();
        this.successMessage = '🎉 Registration successful! Redirecting to login...';
        this.otpStage = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err?.status === 401) {
          this.errorMessage = 'Invalid or expired OTP.';
        } else if (err?.status === 409) {
          this.errorMessage = err?.error?.message || 'Username or email already taken.';
        } else {
          this.errorMessage = err?.error?.message || 'Verification failed. Try again.';
        }
      }
    });
  }

  // ─── Resend OTP ───
  resendOtp(): void {
    if (!this.pendingFormData) {
      this.errorMessage = 'Please fill the form again.';
      this.backToForm();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.registerSendOtp(this.pendingFormData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.maskedEmail = res?.email || '';
        this.infoMessage = this.maskedEmail
          ? `OTP re-sent to ${this.maskedEmail}`
          : 'OTP has been re-sent to your email.';
        this.otpForm.get('otp')?.reset();
        this.startTimer(300);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Unable to resend OTP. Please try again.';
      }
    });
  }

  // ─── Back to form ───
  backToForm(): void {
    this.otpStage = false;
    this.maskedEmail = '';
    this.infoMessage = '';
    this.errorMessage = '';
    this.clearTimer();
    this.otpForm.get('otp')?.reset();
  }

  // ─── Timer ───
  private startTimer(seconds: number): void {
    this.clearTimer();
    this.otpTimer = seconds;
    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        this.otpTimer = 0;
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedTimer(): string {
    const min = Math.floor(this.otpTimer / 60);
    const sec = this.otpTimer % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  // ─── Helpers ───
  get f() { return this.freelancerForm.controls; }
  get o() { return this.otpForm.controls; }
  get isFreelancer(): boolean {
    return this.freelancerForm.get('role')?.value === 'FREELANCER';
  }

  get passwordValue(): string {
    return this.freelancerForm.get('password')?.value || '';
  }
  get hasMinLength(): boolean { return this.passwordValue.length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.passwordValue); }
  get hasLowercase(): boolean { return /[a-z]/.test(this.passwordValue); }
  get hasNumber(): boolean { return /[0-9]/.test(this.passwordValue); }
  get hasSpecialChar(): boolean { return /[@$!%*?&#]/.test(this.passwordValue); }

  get passwordStrength(): number {
    let s = 0;
    if (this.hasMinLength) s++;
    if (this.hasUppercase) s++;
    if (this.hasLowercase) s++;
    if (this.hasNumber) s++;
    if (this.hasSpecialChar) s++;
    return s;
  }

  get passwordStrengthLabel(): string {
    if (this.passwordStrength >= 5) return 'Strong';
    if (this.passwordStrength >= 3) return 'Medium';
    if (this.passwordStrength >= 1) return 'Weak';
    return '';
  }

  get passwordStrengthColor(): string {
    if (this.passwordStrength >= 5) return '#10b981';
    if (this.passwordStrength >= 3) return '#f59e0b';
    return '#ff2d95';
  }

  get passwordStrengthWidth(): string {
    return (this.passwordStrength / 5 * 100) + '%';
  }
}
