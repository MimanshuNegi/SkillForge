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
      contactNumber: [''] // optional
    });
  }

  onSubmit(): void {

    if (this.freelancerForm.invalid) {
      this.freelancerForm.markAllAsTouched();
      return;
    }

    const formData = this.freelancerForm.value;

    this.authService.registerUser(formData).subscribe({
      next: (res) => {
        alert("Registration successful");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert("Registration failed");
        this.router.navigate(['/register']);
      }
    });
  }

  get f() {
    return this.freelancerForm.controls;
  }
}