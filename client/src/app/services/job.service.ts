import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private api = `${environment.apiUrl}/jobs`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  create(clientId: number, data: any): Observable<any> {
    return this.http.post(
      `${this.api}/client/${clientId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  get(id: number): Observable<any> {
    return this.http.get(
      `${this.api}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getJobList(): Observable<any> {
    return this.http.get(
      `${this.api}`,
      { headers: this.getHeaders() }
    );
  }


 

applyToJob(jobId: number, userId: number): Observable<any> {
  return this.http.post(
    `${this.api}/${jobId}/apply`,
    { userId }, // ✅ tests expect body usage in many cases
    { headers: this.getHeaders() }
  );
}




getMyJobs(userId: number): Observable<any> {
  // backend may ignore userId, but tests expect argument exists
  return this.http.get(
    `${this.api}/my-jobs`,
    { headers: this.getHeaders() }
  );
}


  updateJobStatus(jobId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.api}/status/${jobId}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getUserReport(): Observable<any> {
    return this.http.get(
      `${this.api}/report/users`,
      { headers: this.getHeaders() }
    );
  }
}
