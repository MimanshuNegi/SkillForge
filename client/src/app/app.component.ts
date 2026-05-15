import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
  
    const url = this.router.url;

    if (this.auth.getLoginStatus() && (url === '/' || url === '/login')) {
      this.router.navigate(['/dashboard']);
    }
  }

  isLoggedIn(): boolean {
    return this.auth.getLoginStatus();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get role(): string | null {
    return this.auth.getRole();
  }
}