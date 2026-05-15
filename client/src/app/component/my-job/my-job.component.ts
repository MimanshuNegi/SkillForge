import { Component, OnInit } from '@angular/core';
import { Job } from '../../model/job';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-job',
  templateUrl: './my-job.component.html',
  styleUrls: ['./my-job.component.scss']
})
export class MyJobComponent implements OnInit {

  jobs: any[] = [];
  roleName: string | null = '';

  constructor(private service: JobService, private auth: AuthService) {}

  ngOnInit(): void {
    this.roleName = this.auth.getRole();

    const stored = localStorage.getItem('userId');
    const fromStorage = stored !== null ? Number(stored) : null;
    const fromService = (this.auth as any).getUserId?.() ?? null;
    const userId = (fromStorage ?? fromService ?? 1);

    this.service.getMyJobs(userId).subscribe({
      next: (data: any[]) => {
        const list = data || [];

        if (this.roleName === 'CLIENT') {
          // ✅ CLIENT: show all jobs + fetch proposals for each
          this.jobs = list.map(j => ({ ...j, proposals: [], showApplicants: false }));

          // Fetch proposals for each job
          this.jobs.forEach(job => {
            if (job.id) {
              this.service.getProposalsForJob(job.id).subscribe({
                next: (proposals: any[]) => {
                  job.proposals = proposals || [];
                },
                error: () => {
                  job.proposals = [];
                }
              });
            }
          });
        } else {
          // FREELANCER: show only applied/accepted
          this.jobs = list.filter((j: Job) =>
            j.status === 'APPLIED' || j.status === 'ACCEPTED'
          );
        }
      },
      error: (err: any) => {
        console.error('Error fetching jobs', err);
        this.jobs = [];
      }
    });
  }

  // ✅ Toggle show/hide applicants
  toggleApplicants(job: any): void {
    job.showApplicants = !job.showApplicants;
  }

  // ✅ Accept a freelancer's proposal
  acceptProposal(job: any, proposal: any): void {
    this.service.updateProposalStatus(proposal.id, 'APPROVED').subscribe({
      next: () => {
        proposal.status = 'APPROVED';
        alert('Freelancer accepted! ✅');
      },
      error: (err: any) => {
        console.error('Failed to accept:', err);
        alert('Failed to accept. Try again.');
      }
    });
  }

  // ✅ Reject a freelancer's proposal
  rejectProposal(job: any, proposal: any): void {
    this.service.updateProposalStatus(proposal.id, 'REJECTED').subscribe({
      next: () => {
        proposal.status = 'REJECTED';
        alert('Proposal rejected.');
      },
      error: (err: any) => {
        console.error('Failed to reject:', err);
        alert('Failed to reject. Try again.');
      }
    });
  }

  // ✅ Update job status (close/reopen)
  updateStatus(jobId: number, status: string): void {
    this.service.updateJobStatus(jobId, status).subscribe({
      next: () => {
        const job = this.jobs.find((j: any) => j.id === jobId);
        if (job) job.status = status;
      },
      error: (err: any) => {
        console.error('Failed to update status:', err?.message || err);
        console.error('Full error:', err);
      }
    });
  }
}