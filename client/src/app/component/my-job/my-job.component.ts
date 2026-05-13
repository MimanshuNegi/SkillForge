import { Component, OnInit } from '@angular/core';
import { Job } from '../../model/job';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-job',
  templateUrl: './my-job.component.html',
  styleUrls: ['./my-job.component.scss']
})
export class MyJobComponent implements OnInit{
jobs: Job[] = [];

  constructor(private service: JobService, private auth: AuthService) {}

  ngOnInit() {
    const userId = this.auth.getUserId();

    this.service.getMyJobs(userId!).subscribe((data: Job[]) => {
      this.jobs = data.filter((j: Job) =>
        j.status === 'APPLIED' || j.status === 'ACCEPTED'
      );
    });
  }

  updateStatus(jobId: number, status: string) {
    this.service.updateJobStatus(jobId, status).subscribe(() => {
      const job = this.jobs.find((j: Job) => j.id === jobId);
      if (job) {
        job.status = status;
      }
    });
  }

}