import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Proposal } from '../model/proposal';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProposalService {

  private api = `${environment.apiUrl}/proposals`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  create(freelancerId: number, data: Proposal): Observable<any> {
    return this.http.post(
      `${this.api}/freelancer/${freelancerId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getMyProposals(): Observable<any> {
    return this.http.get(
      `${this.api}/myProposal`,
      { headers: this.getHeaders() }
    );
  }
}
``