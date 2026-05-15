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

  constructor(private service: JobService, private auth: AuthService) { }

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
          this.jobs = list.map(j => ({ ...j, proposals: [], showApplicants: false }));

          this.jobs.forEach(job => {
            if (job.id) {
              this.service.getProposalsForJob(job.id).subscribe({
                next: (proposals: any[]) => {
                  job.proposals = (proposals || []).map((p: any) => ({
                    ...p,
                    showProfile: false  // ✅ profile toggle per applicant
                  }));
                },
                error: () => {
                  job.proposals = [];
                }
              });
            }
          });
        } else {
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

  toggleApplicants(job: any): void {
    job.showApplicants = !job.showApplicants;
  }

  // ✅ Toggle freelancer profile
  toggleProfile(proposal: any): void {
    proposal.showProfile = !proposal.showProfile;
  }

  acceptProposal(job: any, proposal: any): void {
    this.service.updateProposalStatus(proposal.id, 'APPROVED').subscribe({
      next: () => {
        proposal.status = 'COMPLETED';
        alert('Freelancer accepted! ✅');
      },
      error: (err: any) => {
        console.error('Failed to accept:', err);
        alert('Failed to accept. Try again.');
      }
    });
  }

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

  // ✅ Pass the job object directly (not just jobId)

  updateStatus(jobOrId: any, status: string): void {
    // ✅ Handle both: tests pass number, UI passes object
    let jobId: number;
    let jobObj: any = null;

    if (typeof jobOrId === 'number') {
      // Called from tests: updateStatus(1, 'COMPLETED')
      jobId = jobOrId;
      jobObj = this.jobs.find(j => j.id === jobId);
    } else {
      // Called from UI: updateStatus(j, 'CLOSED')
      jobId = jobOrId.id;
      jobObj = jobOrId;
    }

    this.service.updateJobStatus(jobId, status).subscribe({
      next: () => {
        if (jobObj) {
          jobObj.status = status;
        }
      },
      error: (err: any) => {
        console.error('Failed to update status:', err?.message || err);
        console.error('Full error:', err);
      }
    });
  }



  deleteJob(jobId: number): void {
    if (!confirm('Are you sure you want to delete this job?')) return;

    this.service.deleteJob(jobId).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j.id !== jobId);
        alert('Job deleted! 🗑️');
      },
      error: (err: any) => {
        console.error('Error deleting job:', err);
        alert('Failed to delete job.');
      }
    });
  }
}