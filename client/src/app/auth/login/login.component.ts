import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../model/loginrequest';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  // Step control for 2FA
  otpStage: boolean = false; // false = credentials screen, true = OTP screen

  loginForm!: FormGroup;
  otpForm!: FormGroup;

  errorMessage: string = '';
  infoMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  // Optional: show where OTP was sent
  maskedEmail: string = '';

  // Timer
  otpTimer: number = 0;
  private timerInterval: any;

  // Keep credentials in memory for resend OTP (not localStorage)
  private pendingLoginRequest: LoginRequest | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.otpForm = this.fb.group({
      username: [{ value: '', disabled: true }], // username is set from login step
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  //   STEP 1: Username+Password => /login => OTP Sent (NO JWT)
  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    const loginRequest: LoginRequest = this.loginForm.value;
    this.pendingLoginRequest = loginRequest; // for resend

    this.authService.login(loginRequest).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        // Move to OTP step
        this.otpStage = true;

        // Set username into OTP form (disabled control)
        this.otpForm.get('username')?.setValue(loginRequest.username);
        this.otpForm.get('otp')?.reset();

        // Optional if backend returns masked email
        this.maskedEmail = res?.email || '';
        this.infoMessage = this.maskedEmail
          ? `OTP sent to ${this.maskedEmail}`
          : 'OTP has been sent to your registered email.';

        this.startTimer(300); // 5 minutes
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else if (error.status === 0) {
          this.errorMessage = 'Server not reachable';
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Try again.';
        }
      }
    });
  }

  //   STEP 2: OTP => /verify-otp => JWT returned and saved (inside AuthService.verifyOtp tap)
  verifyOtp(): void {
    if (this.otpForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    const username = this.otpForm.get('username')?.value;
    const otp = this.otpForm.get('otp')?.value;

    this.authService.verifyOtp(username, otp).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        // Role-based navigation
        const routeMap: any = {
          ADMIN: '/dashboard',
          CLIENT: '/dashboard',
          FREELANCER: '/dashboard'
        };

        this.router.navigate([routeMap[res.role] || '/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;

        if (err.status === 401) {
          this.errorMessage = 'Invalid or expired OTP';
        } else if (err.status === 0) {
          this.errorMessage = 'Server not reachable';
        } else {
          this.errorMessage = err.error?.message || 'OTP verification failed.';
        }
      }
    });
  }

  // 🔁 Resend OTP: re-call /login using saved credentials
  resendOtp(): void {
    if (!this.pendingLoginRequest) {
      this.errorMessage = 'Please login again to resend OTP.';
      this.backToLogin();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.login(this.pendingLoginRequest).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        this.maskedEmail = res?.email || '';
        this.infoMessage = this.maskedEmail
          ? `OTP re-sent to ${this.maskedEmail}`
          : 'OTP has been re-sent to your registered email.';

        this.otpForm.get('otp')?.reset();
        this.startTimer(300);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Unable to resend OTP. Please login again.';
        this.backToLogin();
      }
    });
  }

  // ⬅️ Go back to credentials step
  backToLogin(): void {
    this.otpStage = false;
    this.maskedEmail = '';
    this.infoMessage = '';
    this.errorMessage = '';
    this.clearTimer();
    this.otpForm.get('otp')?.reset();
  }

  // Timer helpers
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

  get f() {
    return this.loginForm.controls;
  }

  get o() {
    return this.otpForm.controls;
  }
}
