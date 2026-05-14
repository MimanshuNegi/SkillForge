import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(public auth: AuthService, private router: Router) {}

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
