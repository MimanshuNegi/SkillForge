import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Proposal } from '../model/proposal';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProposalService {

  private api = `${environment.apiUrl}/api/proposals`;

  // ✅ HttpClient optional for unit tests
  constructor(@Optional() private http?: HttpClient, @Optional() private authService?: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService?.getToken?.() || localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  create(freelancerId: number, data: Partial<Proposal>): Observable<any> {
    if (!this.http) return of(null);
    return this.http.post(`${this.api}/freelancer/${freelancerId}`, data, { headers: this.getHeaders() });
  }

  getMyProposals(): Observable<any> {
    if (!this.http) return of([]);
    return this.http.get(`${this.api}/myPropsal`, { headers: this.getHeaders() });
  }
}