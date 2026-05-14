import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User, Role } from '../../model/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profile: any;
  users: any[] = [];
  roleName: Role | null = null;
  errorMessage: string = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.roleName = this.auth.getRole();
    this.getUser(); // tests call this method directly
  }

  // REQUIRED by tests: component.getUser()
  getUser(): void {

    this.roleName = this.auth.getRole();

    // FREELANCER: fetch own profile
    if (this.roleName === 'FREELANCER') {
      const id = this.auth.getUserId();

      if (id != null) {
        this.auth.getLoggedInUser(id).subscribe({
          next: (res: any) => this.profile = res,
          error: () => this.errorMessage = 'Failed to load profile'
        });
      }
    }

    // ADMIN: fetch users list (excluding admins)
    if (this.roleName === 'ADMIN') {
      this.auth.getUsers().subscribe({
        next: (res: any) => {
          this.users = (res || []).filter((u: any) => u.role !== 'ADMIN');
        },
        error: () => this.errorMessage = 'Failed to load users'
      });
    }
  }
}