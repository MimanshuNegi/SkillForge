import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../model/loginrequest';
import { LoginResponse } from '../model/login-response';
import { Role } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private baseUrl: string = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  registerUser(user: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.post(`${this.baseUrl}/register`, user, { headers });
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, loginRequest)
      .pipe(
        tap((response: LoginResponse) => {
          this.saveToken(response.token);
          this.setRole(response.role);
        })
      );
  }

  saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  setRole(role: string): void {
    localStorage.setItem('role', role);
  }

  getRole(): Role | null {
    const role = localStorage.getItem('role');
    return role ? (role as Role) : null;
  }

  saveUserId(userId: number): void {
    localStorage.setItem('userId', userId.toString());
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? Number(id) : null;
  }

  getLoginStatus(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isManager(): boolean {
    return this.getRole() === 'CLIENT';
  }

  isCustomer(): boolean {
    return this.getRole() === 'FREELANCER';
  }

  getLoggedInUser(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get(`${this.baseUrl}/user/${userId}`, { headers });
  }

  getUsers(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get(`${this.baseUrl}`, { headers });
  }
}