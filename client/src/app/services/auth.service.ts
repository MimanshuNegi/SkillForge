import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Role, User } from '../model/user';
import { LoginRequest } from '../model/loginrequest';
import { LoginResponse } from '../model/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, request).pipe(
      tap((response: LoginResponse) => {
        this.token = response.token;
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('role', response.role);
      })
    );
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('authToken');
  }

  getRole(): Role | null {
    const role = localStorage.getItem('role');
    return role ? role as Role : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
