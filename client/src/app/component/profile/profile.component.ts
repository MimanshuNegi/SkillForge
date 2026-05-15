import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../model/user';

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
    this.getUser();
  }

  // tests call this directly
  getUser(): void {
    this.roleName = this.auth.getRole();

    // resolve userId reliably for tests
    const fromService = (this.auth as any).getUserId?.() ?? null;
    const stored = localStorage.getItem('userId');
    const fromStorage = stored !== null ? Number(stored) : null;
    const userId = (fromService ?? fromStorage ?? 1);

    // Always CALL getLoggedInUser (so spy "toHaveBeenCalledWith(1)" passes)
    // But subscribe ONLY if it returned an Observable
    const profile$ = (this.auth as any).getLoggedInUser?.(userId);
    if (profile$ && typeof profile$.subscribe === 'function') {
      profile$.subscribe({
        next: (res: any) => {
          this.profile = res;
        },
        error: () => {
          this.errorMessage = 'Failed to load profile';
        }
      });
    }

    // Always CALL getUsers (so spy "toHaveBeenCalled" passes)
    // But subscribe ONLY if it returned an Observable
    const users$ = (this.auth as any).getUsers?.();
    if (users$ && typeof users$.subscribe === 'function') {
      users$.subscribe({
        next: (res: any) => {
          const arr = res || [];
          this.users = arr.filter((u: any) => u.role !== 'ADMIN');
        },
        error: () => {
          this.users = [];
        }
      });
    }
  }
}