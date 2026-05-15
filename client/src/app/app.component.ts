import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{

  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.auth.getLoginStatus()) {
      const role = this.auth.getRole();

      if (role === 'ADMIN') {
        this.router.navigate(['/users']);
      } else if (role === 'CLIENT') {
        this.router.navigate(['/job-create']);
      } else if (role === 'FREELANCER') {
        this.router.navigate(['/job-list']);
      }
    }
  }

  // ✅ check login status
  isLoggedIn(): boolean {
    return this.auth.getLoginStatus();
  }

  // ✅ logout
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // ✅ get role (optional for UI display)
  get role(): string | null {
    return this.auth.getRole();
  }
}
