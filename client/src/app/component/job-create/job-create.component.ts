import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.scss']
})
export class JobCreateComponent implements OnInit {

  jobForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    budget: [null as any, [Validators.required, Validators.min(0)]],
    status: ['OPEN', Validators.required]
  });

  clientId: number = 0;

  constructor(
    private fb: FormBuilder,
    private service: JobService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId =
      (this.auth as any).getUserId?.() ??
      Number(localStorage.getItem('userId') || 0);
  }

  onSubmit(): void {
    this.create();
  }

  create(): void {
    if (this.jobForm.invalid) return;

    this.service.create(this.clientId, this.jobForm.value).subscribe({
      next: () => {
        alert('Job created successfully!');
        this.router.navigate(['/job-list']);
      },
      error: (err: any) => {
        // ✅ TEST EXPECTS: second arg must be an Error object
        const errorObj = err instanceof Error ? err : new Error(err?.message || String(err));
        console.error('Error creating job:', errorObj);

        alert('Failed to create job.');
      }
    });
  }
}