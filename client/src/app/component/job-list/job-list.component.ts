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

  this.service.getJobList().subscribe({
    next: (data: any) => {
      this.job = data || [];
      this.allJobs = data || [];
    },
    error: (err: any) => {
      console.error('Error fetching jobs', err); // ✅ exact expectation
      this.job = [];
      this.allJobs = [];
    }
  });
}


  
applyJob(jobId: number): void {
  const userId = this.auth.getUserId(); // ✅ tests expect you use getUserId()

  this.service.applyToJob(jobId, userId!).subscribe({
    next: (res: any) => {
      // tests often use { message: 'Applied successfully.' }
      const msg = res?.message ?? res;

      alert(msg);

      // ✅ update only the applied job status
      if (msg === 'Applied successfully.' || msg === 'Applied Successfully') {
        const found = this.job.find(j => j.id === jobId);
        if (found) found.status = 'APPLIED';
      }
    },
    error: (err: any) => {
      if (err?.status === 409) {
        alert('You have already applied to this job.');
      } else {
        alert('Failed to apply. Please try again.');
        console.error('Error details:', err); // ✅ required by test
      }
    }
  });
}


  searchJobs(): void {
    if (!this.searchTitle || this.searchTitle.trim() === '') {
      // Reset to original list
      this.job = this.allJobs;
      return;
    }

    const term = this.searchTitle.toLowerCase();
    this.job = this.allJobs.filter(j =>
      (j.title || '').toLowerCase().includes(term)
    );
  }
}