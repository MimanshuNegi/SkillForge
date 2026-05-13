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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(this.loginRequest).subscribe(
      (response) => {
        this.authService.saveToken(response.token);
        this.authService.setRole(response.role);
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (response.role === 'CLIENT') {
          this.router.navigate(['/client']);
        } else if (response.role === 'FREELANCER') {
          this.router.navigate(['/freelancer']);
        } else {
          this.router.navigate(['/']);
        }
      },
      (error) => {
        console.error(error);
        this.errorMessage = 'Invalid username or password';
      }
    );
  }

  get f() {
    return this.loginForm.controls;
  }
}