import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../model/loginrequest';
import { LoginResponse } from '../model/login-response';
import { Role, User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private baseUrl: string = environment.apiUrl;

  // HttpClient is optional so unit tests won't throw "No provider for HttpClient"
  constructor(@Optional() private http?: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  registerUser(user: User): Observable<User> {
    if (!this.http) throw new Error('HttpClient not available');
    return this.http.post<User>(
      `${this.baseUrl}/api/auth/register`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    if (!this.http) throw new Error('HttpClient not available');
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/api/auth/login`,
      loginRequest,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap((res: LoginResponse) => {
        this.saveToken(res.token);
        this.setRole(res.role as Role);

        const anyRes: any = res as any;
        if (anyRes.userId !== undefined && anyRes.userId !== null) {
          this.saveUserId(Number(anyRes.userId));
        }
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

  setRole(role: Role): void {
    localStorage.setItem('role', role);
  }

  getRole(): Role | null {
    const role = localStorage.getItem('role');
    return role ? (role as Role) : null;
  }

  saveUserId(userId: number): void {
    localStorage.setItem('userId', String(userId));
  }

  getUserId(): number | null {
    const val = localStorage.getItem('userId');
    return val ? Number(val) : null;
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

  getLoggedInUser(userId: number): Observable<User> {
    if (!this.http) throw new Error('HttpClient not available');
    return this.http.get<User>(
      `${this.baseUrl}/api/auth/user/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getUsers(): Observable<User[]> {
    if (!this.http) throw new Error('HttpClient not available');
    return this.http.get<User[]>(
      `${this.baseUrl}/api/auth`,
      { headers: this.getAuthHeaders() }
    );
  }
}