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

  // ─── Step control ───
  // 'login' | 'otp' | 'forgot-username' | 'forgot-otp' | 'forgot-reset'
  currentStep: string = 'login';

  loginForm!: FormGroup;
  otpForm!: FormGroup;
  forgotUsernameForm!: FormGroup;
  forgotOtpForm!: FormGroup;
  forgotResetForm!: FormGroup;

  errorMessage: string = '';
  infoMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showNewPassword: boolean = false;

  maskedEmail: string = '';

  // Timer
  otpTimer: number = 0;
  private timerInterval: any;

  // Keep data between steps
  private pendingLoginRequest: LoginRequest | null = null;
  private forgotUsername: string = '';

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
      username: [{ value: '', disabled: true }],
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.forgotUsernameForm = this.fb.group({
      username: ['', Validators.required]
    });

    this.forgotOtpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.forgotResetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]+$')
      ]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  // ═══════════════════════════════
  //  LOGIN FLOW (Steps: login → otp)
  // ═══════════════════════════════

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.clearMessages();

    const loginRequest: LoginRequest = this.loginForm.value;
    this.pendingLoginRequest = loginRequest;

    this.authService.login(loginRequest).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.currentStep = 'otp';
        this.otpForm.get('username')?.setValue(loginRequest.username);
        this.otpForm.get('otp')?.reset();
        this.maskedEmail = res?.email || '';
        this.infoMessage = this.maskedEmail
          ? `OTP sent to ${this.maskedEmail}`
          : 'OTP has been sent to your registered email.';
        this.startTimer(300);
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

  verifyOtp(): void {
    if (this.otpForm.invalid) return;

    this.isLoading = true;
    this.clearMessages();

    const username = this.otpForm.get('username')?.value;
    const otp = this.otpForm.get('otp')?.value;

    this.authService.verifyOtp(username, otp).subscribe({
      next: (res: any) => {
        this.isLoading = false;
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

  resendOtp(): void {
    if (!this.pendingLoginRequest) {
      this.errorMessage = 'Please login again to resend OTP.';
      this.backToLogin();
      return;
    }

    this.isLoading = true;
    this.clearMessages();

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

  // ═══════════════════════════════════════
  //  FORGOT PASSWORD FLOW (3 steps)
  // ═══════════════════════════════════════

  // Step 1: Enter username → send OTP
  goToForgotPassword(): void {
    this.currentStep = 'forgot-username';
    this.clearMessages();
    this.forgotUsernameForm.reset();
  }

  forgotSendOtp(): void {
    if (this.forgotUsernameForm.invalid) return;

    this.isLoading = true;
    this.clearMessages();

    this.forgotUsername = this.forgotUsernameForm.get('username')?.value;

    this.authService.forgotPasswordSendOtp(this.forgotUsername).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.currentStep = 'forgot-otp';
        this.maskedEmail = res?.email || '';
        this.infoMessage = this.maskedEmail
          ? `OTP sent to ${this.maskedEmail}`
          : 'OTP sent to your registered email.';
        this.forgotOtpForm.get('otp')?.reset();
        this.startTimer(300);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.errorMessage = 'No account found with this username.';
        } else if (err.status === 0) {
          this.errorMessage = 'Server not reachable.';
        } else {
          this.errorMessage = err.error?.message || 'Failed to send OTP.';
        }
      }
    });
  }

  // Step 2: Verify OTP → go to reset
  forgotVerifyOtp(): void {
    if (this.forgotOtpForm.invalid) return;

    // OTP will be verified on final submit along with new password
    this.currentStep = 'forgot-reset';
    this.clearMessages();
    this.forgotResetForm.reset();
    this.showNewPassword = false;
  }

  // Step 3: Set new password → reset
  forgotResetPassword(): void {
    if (this.forgotResetForm.invalid) return;

    const newPassword = this.forgotResetForm.get('newPassword')?.value;
    const confirmPassword = this.forgotResetForm.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const otp = this.forgotOtpForm.get('otp')?.value;

    this.authService.forgotPasswordReset(this.forgotUsername, otp, newPassword).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.clearTimer();
        this.successMessage = '🎉 Password reset successful! You can now login.';
        this.currentStep = 'login';
        this.loginForm.reset();
        setTimeout(() => { this.successMessage = ''; }, 5000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'OTP expired. Please start over.';
          this.currentStep = 'forgot-username';
        } else {
          this.errorMessage = err.error?.message || 'Password reset failed.';
        }
      }
    });
  }

  // Resend OTP (forgot flow)
  forgotResendOtp(): void {
    this.isLoading = true;
    this.clearMessages();

    this.authService.forgotPasswordSendOtp(this.forgotUsername).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.maskedEmail = res?.email || '';
        this.infoMessage = this.maskedEmail
          ? `OTP re-sent to ${this.maskedEmail}`
          : 'OTP re-sent to your email.';
        this.forgotOtpForm.get('otp')?.reset();
        this.startTimer(300);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to resend OTP.';
      }
    });
  }

  // ═══════════════════════════════
  //  NAVIGATION HELPERS
  // ═══════════════════════════════

  backToLogin(): void {
    this.currentStep = 'login';
    this.clearMessages();
    this.clearTimer();
    this.maskedEmail = '';
  }

  // ═══════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════

  private clearMessages(): void {
    this.errorMessage = '';
    this.infoMessage = '';
    this.successMessage = '';
  }

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

  get f() { return this.loginForm.controls; }
  get o() { return this.otpForm.controls; }

  // ─── Password Strength (for reset form) ───
  get newPasswordValue(): string {
    return this.forgotResetForm.get('newPassword')?.value || '';
  }
  get rpHasMinLength(): boolean { return this.newPasswordValue.length >= 8; }
  get rpHasUppercase(): boolean { return /[A-Z]/.test(this.newPasswordValue); }
  get rpHasLowercase(): boolean { return /[a-z]/.test(this.newPasswordValue); }
  get rpHasNumber(): boolean { return /[0-9]/.test(this.newPasswordValue); }
  get rpHasSpecial(): boolean { return /[@$!%*?&#]/.test(this.newPasswordValue); }

  get rpStrength(): number {
    let s = 0;
    if (this.rpHasMinLength) s++;
    if (this.rpHasUppercase) s++;
    if (this.rpHasLowercase) s++;
    if (this.rpHasNumber) s++;
    if (this.rpHasSpecial) s++;
    return s;
  }

  get rpStrengthLabel(): string {
    if (this.rpStrength >= 5) return 'Strong';
    if (this.rpStrength >= 3) return 'Medium';
    if (this.rpStrength >= 1) return 'Weak';
    return '';
  }

  get rpStrengthColor(): string {
    if (this.rpStrength >= 5) return '#10b981';
    if (this.rpStrength >= 3) return '#f59e0b';
    return '#ef4444';
  }

  get rpStrengthWidth(): string {
    return (this.rpStrength / 5 * 100) + '%';
  }

  get passwordsMatch(): boolean {
    return this.newPasswordValue === (this.forgotResetForm.get('confirmPassword')?.value || '');
  }
}