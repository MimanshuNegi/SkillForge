import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../model/loginrequest';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loginRequest!: LoginRequest;

  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  loginMode: 'password' | 'otp' = 'password';

  otpSent: boolean = false;
  otpSending: boolean = false;

  otpForm!: FormGroup;

  maskedEmail: string = '';

  otpTimer: number = 0;
  timerInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.otpForm = this.fb.group({
      username: ['', Validators.required],
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.loginRequest = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginRequest).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Save token & role
        this.authService.saveToken(response.token);
        this.authService.setRole(response.role);

        //  Save username for ownership checks
        if (response.username) {
          localStorage.setItem('username', response.username);
        }

        // Role-based navigation
        const routeMap: any = {
          ADMIN: '/dashboard',
          CLIENT: '/dashboard',
          FREELANCER: '/dashboard'
        };

        this.router.navigate([routeMap[response.role] || '/dashboard']);
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

  get f() {
    return this.loginForm.controls;
  }

  sendOtp(): void {
  const username = this.otpForm.get('username')?.value;

  if (!username) {
    this.errorMessage = 'Enter username first';
    return;
  }

  this.otpSending = true;
  this.errorMessage = '';

  this.authService.sendOtp(username).subscribe({
    next: (res: any) => {
      this.otpSending = false;
      this.otpSent = true;
      this.maskedEmail = res.email;
      this.startTimer(300); // 5 minutes
    },
    error: (err) => {
      this.otpSending = false;
      this.errorMessage = err.error?.message || 'Failed to send OTP';
    }
  });
}
verifyOtp(): void {
  if (this.otpForm.invalid) return;

  const { username, otp } = this.otpForm.value;

  this.isLoading = true;
  this.errorMessage = '';

  this.authService.verifyOtp(username, otp).subscribe({
    next: (res: any) => {
      this.isLoading = false;

      // ✅ Same flow as login
      const routeMap: any = {
        ADMIN: '/dashboard',
        CLIENT: '/dashboard',
        FREELANCER: '/dashboard'
      };

      this.router.navigate([routeMap[res.role]]);
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = 'Invalid or expired OTP';
    }
  });
}
startTimer(seconds: number) {
  this.otpTimer = seconds;

  this.timerInterval = setInterval(() => {
    this.otpTimer--;
    if (this.otpTimer <= 0) {
      clearInterval(this.timerInterval);
    }
  }, 1000);
}

}