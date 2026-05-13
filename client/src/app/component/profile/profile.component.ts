import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../model/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{
  profile: any;
  users: any[] = [];
  roleName: string | null = '';
  errorMessage: string = '';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.roleName = this.auth.getRole();

    if (this.roleName === 'FREELANCER') {
      this.auth.getLoggedInUser(this.auth.getUserId()!)
        .subscribe(res => this.profile = res);
    }

    if (this.roleName === 'ADMIN') {
      this.auth.getUsers().subscribe((res: any) => {
        this.users = res.filter((u: any) => u.role !== 'ADMIN');
      });
    }
  }
}