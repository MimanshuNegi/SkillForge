import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// ✅ Components
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { JobListComponent } from './component/job-list/job-list.component';
import { JobCreateComponent } from './component/job-create/job-create.component';
import { MyJobComponent } from './component/my-job/my-job.component';
import { MyProposalComponent } from './component/my-proposal/my-proposal.component';
import { ProfileComponent } from './component/profile/profile.component';
import { ReportComponent } from './component/report/report.component';

// ✅ Guard
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  // ✅ Open Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ✅ Protected Routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'job-list', component: JobListComponent, canActivate: [AuthGuard] },
  { path: 'job-create', component: JobCreateComponent, canActivate: [AuthGuard] },
  { path: 'my-job', component: MyJobComponent, canActivate: [AuthGuard] },
  { path: 'my-proposals', component: MyProposalComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'users', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportComponent, canActivate: [AuthGuard] },

  // ✅ Default route
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // ✅ Wildcard route
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
