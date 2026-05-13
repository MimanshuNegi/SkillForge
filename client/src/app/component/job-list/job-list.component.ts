import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job } from '../../model/job';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html'
})
export class JobListComponent implements OnInit{
  job: any[] = [];
  allJobs: any[] = [];
  roleName: string | null = '';
  searchTitle: string = '';

  constructor(private service: JobService, private auth: AuthService) {}

  ngOnInit() {
    this.roleName = this.auth.getRole();

    this.service.getJobList().subscribe((data: any) => {
      this.job = data;
      this.allJobs = data;
    });
  }

  applyJob(jobId: number) {
    const userId = this.auth.getUserId();

    this.service.applyToJob(jobId, userId!).subscribe({
      next: (res: any) => {
        alert(res.message);

        if (res.message === "Applied successfully.") {
          this.job.find(j => j.id === jobId).status = 'APPLIED';
        }
      },
      error: err => {
        alert("Error applying to job");
      }
    });
  }

  searchJobs() {
    if (!this.searchTitle) {
      this.job = this.allJobs;
      return;
    }

    this.job = this.allJobs.filter(j =>
      j.title.toLowerCase().includes(this.searchTitle.toLowerCase())
    );
  }

}