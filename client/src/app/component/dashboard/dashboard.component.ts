import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  roleName: string | null = '';
  username: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.roleName = this.auth.getRole();

    // Try to get username from localStorage
    this.username = localStorage.getItem('username') || 'User';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}