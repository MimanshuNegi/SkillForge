import { Component, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { ProposalService } from '../../services/proposal.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html'
})
export class JobListComponent implements OnInit {

  job: any[] = [];
  allJobs: any[] = [];
  roleName: string | null = '';
  searchTitle: string = '';
  appliedJobIds: Set<number> = new Set(); // ✅ Track applied jobs

  constructor(
    private service: JobService,
    private auth: AuthService,
    private proposalService: ProposalService  // ✅ Inject ProposalService
  ) {}

  ngOnInit(): void {
    this.roleName = this.auth.getRole();

    // ✅ Step 1: If FREELANCER, fetch their proposals first
    if (this.roleName === 'FREELANCER') {
      this.proposalService.getMyProposals().subscribe({
        next: (proposals: any[]) => {
          // ✅ Collect all job IDs the freelancer has applied to
          (proposals || []).forEach((p: any) => {
            if (p.job?.id) {
              this.appliedJobIds.add(p.job.id);
            }
          });

          // ✅ Then fetch jobs
          this.fetchJobs();
        },
        error: () => {
          // If proposals fail, still fetch jobs
          this.fetchJobs();
        }
      });
    } else {
      this.fetchJobs();
    }
  }

  // ✅ Fetch jobs and mark applied ones
  fetchJobs(): void {
    this.service.getJobList().subscribe({
      next: (data: any) => {
        const list = data || [];

        // ✅ Mark jobs that freelancer already applied to
        this.job = list.map((j: any) => ({
          ...j,
          applied: this.appliedJobIds.has(j.id)
        }));

        this.allJobs = [...this.job];
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

        // ✅ Mark as applied locally + in tracking set
        const found = this.job.find(j => j.id === jobId);
        if (found) {
          found.applied = true;
          found.status = 'APPLIED';
        }
        this.appliedJobIds.add(jobId);
      },
      error: (err: any) => {
        if (err?.status === 409) {
          alert('You have already applied to this job.');

          const found = this.job.find(j => j.id === jobId);
          if (found) found.applied = true;
          this.appliedJobIds.add(jobId);
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

  deleteJob(jobId: number): void {
    if (!confirm('Are you sure you want to delete this job?')) return;

    this.service.deleteJob(jobId).subscribe({
      next: () => {
        this.job = this.job.filter(j => j.id !== jobId);
        this.allJobs = this.allJobs.filter(j => j.id !== jobId);
        alert('Job deleted successfully! 🗑️');
      },
      error: (err: any) => {
        console.error('Error deleting job:', err);
        alert('Failed to delete job.');
      }
    });
  }
}