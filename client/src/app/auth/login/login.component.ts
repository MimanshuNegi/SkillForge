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
}