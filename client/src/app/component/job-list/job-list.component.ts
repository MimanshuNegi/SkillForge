import { Component, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html'
})
export class JobListComponent implements OnInit {

  job: any[] = [];
  allJobs: any[] = [];
  roleName: string | null = '';
  searchTitle: string = '';

  constructor(private service: JobService, private auth: AuthService) {}

  ngOnInit(): void {
    this.roleName = this.auth.getRole();

    // ✅ DEBUG: check what role is stored
    console.log('ROLE:', this.roleName);

    this.service.getJobList().subscribe({
      next: (data: any) => {
        this.job = data || [];
        this.allJobs = data || [];

        // ✅ DEBUG: check what status jobs have
        console.log('JOBS:', this.job);
      },
      error: (err: any) => {
        console.error('Error fetching jobs', err);
        this.job = [];
        this.allJobs = [];
      }
    });
  }

  applyJob(jobId: number): void {
    const fromService = (this.auth as any).getUserId?.();
    const stored = localStorage.getItem('userId');
    const fromStorage = stored !== null ? Number(stored) : null;
    const userId = (fromService ?? fromStorage ?? 1);

    this.service.applyToJob(jobId, userId).subscribe({
      next: (res: any) => {
        const msg = res?.message ?? res;
        alert(msg);

        const found = this.job.find(j => j.id === jobId);
        if (found) {
          found.status = 'APPLIED';
        }
      },
      error: (err: any) => {
        if (err?.status === 409) {
          alert('You have already applied to this job.');
        } else {
          alert('Failed to apply. Please try again.');
          console.error('Error details:', err);
        }
      }
    });
  }

  searchJobs(): void {
    if (!this.searchTitle || this.searchTitle.trim() === '') {
      this.job = this.allJobs;
      return;
    }

    const term = this.searchTitle.toLowerCase();
    this.job = this.allJobs.filter(j =>
      (j.title || '').toLowerCase().includes(term)
    );
  }
}