import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent  {
roleName: string | null = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.roleName = this.auth.getRole();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

}