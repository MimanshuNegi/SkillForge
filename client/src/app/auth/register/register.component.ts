import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  freelancerForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

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
    ]],
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(50),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]+$')
      // Must contain: lowercase, uppercase, number, special character
    ]],
    role: ['', Validators.required],
    contactNumber: ['', [
      Validators.pattern('^[0-9]{10}$')
    ]],
    skills: [''],
    bio: ['', [
      Validators.maxLength(500)
    ]]
  });
}

  get isFreelancer(): boolean {
    return this.freelancerForm.get('role')?.value === 'FREELANCER';
  }

  onSubmit(): void {
    if (this.freelancerForm.invalid) {
      this.freelancerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = this.freelancerForm.value;

    this.authService.registerUser(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = '🎉 Registration successful! Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);

        if (err?.status === 409 || err?.error?.includes?.('Duplicate')) {
          this.errorMessage = '⚠️ Username or email already exists.';
        } else if (err?.status === 0) {
          this.errorMessage = '⚠️ Server not reachable.';
        } else {
          this.errorMessage = '⚠️ Registration failed. Please try again.';
        }
      }
    });
  }

  get f() {
  return this.freelancerForm.controls;
}

// ✅ Password validation helpers
get passwordValue(): string {
  return this.freelancerForm.get('password')?.value || '';
}

get hasMinLength(): boolean {
  return this.passwordValue.length >= 8;
}

get hasUppercase(): boolean {
  return /[A-Z]/.test(this.passwordValue);
}

get hasLowercase(): boolean {
  return /[a-z]/.test(this.passwordValue);
}

get hasNumber(): boolean {
  return /[0-9]/.test(this.passwordValue);
}

get hasSpecialChar(): boolean {
  return /[@$!%*?&#]/.test(this.passwordValue);
}

get passwordStrength(): number {
  let strength = 0;
  if (this.hasMinLength) strength++;
  if (this.hasUppercase) strength++;
  if (this.hasLowercase) strength++;
  if (this.hasNumber) strength++;
  if (this.hasSpecialChar) strength++;
  return strength;
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