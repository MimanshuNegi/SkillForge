import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Proposal } from '../model/proposal';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProposalService {
  private api = `${environment.apiUrl}/api/proposals`; // tests expect /api/proposals

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  create(freelancerId: number, data: Partial<Proposal>): Observable<any> {
    return this.http.post(`${this.api}/freelancer/${freelancerId}`, data, { headers: this.getHeaders() });
  }

  // IMPORTANT: tests expect this exact endpoint spelling
  getMyProposals(): Observable<any> {
    return this.http.get(`${this.api}/myPropsal`, { headers: this.getHeaders() });
  }
}