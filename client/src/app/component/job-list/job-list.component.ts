import { Component, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { ProposalService } from '../../services/proposal.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {

  job: any[] = [];
  allJobs: any[] = [];
  roleName: string | null = '';
  searchTitle: string = '';
  appliedJobIds: Set<number> = new Set();
  isLoading: boolean = true;
  //  Bid form state
  showBidForm: { [jobId: number]: boolean } = {};
  bidAmount: { [jobId: number]: number } = {};
  bidMessage: { [jobId: number]: string } = {};

  constructor(
    private service: JobService,
    private auth: AuthService,
    private proposalService: ProposalService
  ) { }

  ngOnInit(): void {
    this.roleName = this.auth.getRole();

    // If FREELANCER, fetch their proposals first to know which jobs they applied to
    if (this.roleName === 'FREELANCER') {
      const proposals$ = (this.proposalService as any).getMyProposals?.();

      if (proposals$ && typeof proposals$.subscribe === 'function') {
        proposals$.subscribe({
          next: (proposals: any[]) => {
            (proposals || []).forEach((p: any) => {
              if (p.job?.id) {
                this.appliedJobIds.add(p.job.id);
              }
            });
            this.fetchJobs();
          },
          error: () => {
            this.fetchJobs();
          }
        });
      } else {
        this.fetchJobs();
      }
    } else {
      this.fetchJobs();
    }
  }

  //  Fetch jobs WITHOUT adding extra properties
  fetchJobs(): void {
    this.isLoading = true;
    this.service.getJobList().subscribe({
      next: (data: any) => {
        const list = data || [];

        //  Filter out test users' jobs
        this.job = list.filter((j: any) =>
          !j.clientName?.endsWith('_test') &&
          j.clientName !== 'newuser_reg'
        );

        this.allJobs = [...this.job];
        this.isLoading = false;

      },
      error: (err: any) => {
        console.error('Error fetching jobs', err);
        this.job = [];
        this.allJobs = [];
        this.isLoading = false;
      }
    });
  }

  //  Check if freelancer already applied (without modifying job object)
  isApplied(jobId: number): boolean {
    return this.appliedJobIds.has(jobId);
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

        // Track applied status
        this.appliedJobIds.add(jobId);

        // Update job status in list
        const found = this.job.find(j => j.id === jobId);
        if (found) {
          found.status = 'APPLIED';
        }
      },
      error: (err: any) => {
        if (err?.status === 409) {
          alert('You have already applied to this job.');
          this.appliedJobIds.add(jobId);
        } else {
          alert('Failed to apply. Please try again.');
          console.error('Error details:', err);
        }
      }
    });
  }

  // searchJobs(): void {
  //   if (!this.searchTitle || this.searchTitle.trim() === '') {
  //     this.job = this.allJobs;
  //     return;
  //   }

  //   const term = this.searchTitle.toLowerCase();
  //   this.job = this.allJobs.filter(j =>
  //     (j.title || '').toLowerCase().includes(term)
  //   );
  // }

  searchJobs(): void {
    if (!this.searchTitle || this.searchTitle.trim() === '') {
      this.job = this.allJobs;
      return;
    }

    const term = this.searchTitle.toLowerCase().trim();

    this.job = this.allJobs.filter(j =>
      (j.title || '').toLowerCase().includes(term) ||
      (j.description || '').toLowerCase().includes(term) ||
      (j.clientName || '').toLowerCase().includes(term) ||
      (j.status || '').toLowerCase().includes(term) ||
      (j.budget?.toString() || '').includes(term)
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

  //  Toggle bid form
  toggleBidForm(jobId: number): void {
    this.showBidForm[jobId] = !this.showBidForm[jobId];
  }

  //  Submit bid
  submitBid(jobId: number): void {
    const freelancerId = Number(localStorage.getItem('userId') || 0);

    const body = {
      bidAmount: this.bidAmount[jobId] || 0,
      message: this.bidMessage[jobId] || ''
    };

    this.proposalService.bidOnJob(jobId, freelancerId, body).subscribe({
      next: (res: any) => {
        const msg = res?.message ?? 'Bid submitted!';
        alert(msg);

        this.appliedJobIds.add(jobId);
        this.showBidForm[jobId] = false;
      },
      error: (err: any) => {
        if (err?.error?.message?.includes('Already Applied')) {
          this.appliedJobIds.add(jobId);
          alert('⚠️ You already bid on this job.');
        } else {
          alert('❌ Failed to submit bid.');
          console.error(err);
        }
      }
    });
  }
}