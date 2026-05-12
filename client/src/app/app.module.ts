import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { JobListComponent } from './component/job-list/job-list.component';
import { JobCreateComponent } from './component/job-create/job-create.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { MyJobComponent } from './component/my-job/my-job.component';
import { BrowseJobsComponent } from './component/browse-jobs/browse-jobs.component';
import { MyProposalComponent } from './component/my-proposal/my-proposal.component';
import { ProfileComponent } from './component/profile/profile.component';
import { ReportComponent } from './component/report/report.component';




@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    JobListComponent,
    JobCreateComponent,
    DashboardComponent,
    MyJobComponent,
    BrowseJobsComponent,
    MyProposalComponent,
    ProfileComponent,
    ReportComponent,
  
   
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
  //Write your logic here
}
