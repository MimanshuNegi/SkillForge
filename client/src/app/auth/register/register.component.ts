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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.freelancerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      contactNumber: [''],
      skills: [''],       // ✅ Added
      bio: ['']           // ✅ Added
    });
  }

  // ✅ Check if selected role is FREELANCER (to show/hide skills & bio)
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
}