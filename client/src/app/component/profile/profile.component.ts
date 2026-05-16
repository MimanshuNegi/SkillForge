import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../model/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {

  profile: any;
  users: any[] = [];
  roleName: Role | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  // ✅ Edit mode
  isEditing: boolean = false;
  editForm: any = {};

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.roleName = this.auth.getRole();
    this.getUser();
  }

  getUser(): void {
    this.roleName = this.auth.getRole();

    const fromService = (this.auth as any).getUserId?.() ?? null;
    const stored = localStorage.getItem('userId');
    const fromStorage = stored !== null ? Number(stored) : null;
    const userId = (fromService ?? fromStorage ?? 1);

    const profile$ = (this.auth as any).getLoggedInUser?.(userId);
    if (profile$ && typeof profile$.subscribe === 'function') {
      profile$.subscribe({
        next: (res: any) => {
          this.profile = res;
          // ✅ Pre-fill edit form
          this.editForm = { ...res };
        },
        error: () => {
          this.errorMessage = 'Failed to load profile';
        }
      });
    }

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

  // ✅ Toggle edit mode
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isEditing) {
      this.editForm = { ...this.profile };
    }
  }

  // ✅ Save profile changes
  saveProfile(): void {
    const userId = this.profile?.id;
    if (!userId) return;

    this.auth.updateUser(userId, this.editForm).subscribe({
      next: (res: any) => {
        this.profile = res;
        this.isEditing = false;
        this.successMessage = '✅ Profile updated successfully!';
        this.errorMessage = '';

        // Update username in localStorage if changed
        if (res.username) {
          localStorage.setItem('username', res.username);
        }

        // Clear success after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        console.error('Error updating profile:', err);
        this.errorMessage = 'Failed to update profile. Please try again.';
      }
    });
  }

  // ✅ Cancel edit
  cancelEdit(): void {
    this.isEditing = false;
    this.editForm = { ...this.profile };
    this.errorMessage = '';
  }

  // ✅ Delete user (ADMIN)
  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.auth.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        alert('User deleted! 🗑️');
      },
      error: (err: any) => {
        console.error('Error deleting user:', err);
        alert('Failed to delete user.');
      }
    });
  }
}
