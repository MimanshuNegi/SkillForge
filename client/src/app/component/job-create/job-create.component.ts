import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.component.html'
})
export class JobCreateComponent {
  jobForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    budget: [0, [Validators.required, Validators.min(0)]],
    status: ['OPEN', Validators.required]
  });

  clientId: number = this.auth.getUserId()!;

  constructor(private fb: FormBuilder, private service: JobService, private auth: AuthService, private router: Router) { }


  onSubmit(): void {
    this.create();
  }


  create() {
    if (this.jobForm.invalid) return;

    this.service.create(this.clientId, this.jobForm.value).subscribe({
      next: () => {
        alert("Job created successfully!");
        this.router.navigate(['/job-list']);
      },
      error: () => {
        alert("Failed to create job.");
      }
    });
  }
}