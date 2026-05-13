import { Component, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';
import { Job } from '../../model/job';

@Component({
  selector: 'app-browse-jobs',
  templateUrl: './browse-jobs.component.html',
  styleUrls: ['./browse-jobs.component.scss']
})
export class BrowseJobsComponent implements OnInit{
jobs: Job[] = [];

  constructor(private service: JobService) {}

  ngOnInit() {
    this.service.getJobList().subscribe((data: Job[]) => {
      this.jobs = data.filter(j => j.status === 'OPEN');
    });
  }

}