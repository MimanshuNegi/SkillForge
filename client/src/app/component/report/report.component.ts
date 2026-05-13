import { Component, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit{

userReport: any;

  constructor(private service: JobService) {}

  ngOnInit() {
    this.service.getUserReport().subscribe(res => {
      this.userReport = res;
    });
  }

}