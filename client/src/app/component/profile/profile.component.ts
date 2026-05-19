import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  profile: any;
  users: any[] = [];
  roleName: Role | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isEditing: boolean = false;
  isUsersPage: boolean = false;
  editForm: any = {};
  isLoadingUsers: boolean = true;
  isLoadingProfile: boolean = true;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.roleName = this.auth.getRole();
    this.isUsersPage = this.router.url === '/users';
    this.getUser();
  }

  getUser(): void {
    this.roleName = this.auth.getRole();

    const fromService = (this.auth as any).getUserId?.() ?? null;
    const stored = sessionStorage.getItem('userId');
    const fromStorage = stored !== null ? Number(stored) : null;
    const userId = (fromService ?? fromStorage ?? 1);

    // Load profile
    this.isLoadingProfile = true;
    const profile$ = (this.auth as any).getLoggedInUser?.(userId);
    if (profile$ && typeof profile$.subscribe === 'function') {
      profile$.subscribe({
        next: (res: any) => {
          this.profile = res;
          this.editForm = { ...res };
          this.isLoadingProfile = false;
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to load profile';
          this.isLoadingProfile = false;
        }
      });
    } else {
      this.isLoadingProfile = false;
    }

    // Load users
    this.isLoadingUsers = true;
    const users$ = (this.auth as any).getUsers?.();
    if (users$ && typeof users$.subscribe === 'function') {
      users$.subscribe({
        next: (res: any) => {
          const arr = res || [];
          this.users = arr.filter((u: any) =>
            u.role !== 'ADMIN' &&
            !u.username?.endsWith('_test') &&
            u.username !== 'newuser_reg'
          );
          this.isLoadingUsers = false;
        },
        error: (err: any) => {
          this.users = [];
          this.isLoadingUsers = false;
        }
      });
    } else {
      this.isLoadingUsers = false;
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.isEditing) {
      this.editForm = { ...this.profile };
    }
  }

 saveProfile(): void {
  const userId = this.profile?.id;
  if (!userId) return;

  this.auth.updateUser(userId, this.editForm).subscribe({
    next: (res: any) => {
      this.profile = res;
      this.isEditing = false;
      this.successMessage = '✅ Profile updated successfully!';
      this.errorMessage = '';

      //  Save fresh token (so JWT matches new username)
      if (res.token) {
        this.auth.saveToken(res.token);
      }

      if (res.username) {
        sessionStorage.setItem('username', res.username);
      }

      setTimeout(() => { this.successMessage = ''; }, 3000);
    },
    error: (err: any) => {
      //  Show specific error messages
      if (err?.status === 409) {
        this.errorMessage = err?.error?.message || 'Username or email already taken.';
      } else if (err?.status === 0) {
        this.errorMessage = 'Server not reachable.';
      } else {
        this.errorMessage = 'Failed to update profile. Please try again.';
      }
    }
  });
}

  cancelEdit(): void {
    this.isEditing = false;
    this.editForm = { ...this.profile };
    this.errorMessage = '';
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.auth.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        alert('User deleted! 🗑️');
      },
      error: (err: any) => {
        alert('Failed to delete user.');
      }
    });
  }
}