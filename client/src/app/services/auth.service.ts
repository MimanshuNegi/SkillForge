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

        //  Save userId
        if (anyRes.userId !== undefined && anyRes.userId !== null) {
          this.saveUserId(Number(anyRes.userId));
        }

        //  Save username
        if (anyRes.username) {
          localStorage.setItem('username', anyRes.username);
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

  //  Clear username on logout
  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
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

  deleteUser(userId: number): Observable<any> {
    if (!this.http) throw new Error('HttpClient not available');
    return this.http.delete(
      `${this.baseUrl}/api/auth/user/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateUser(userId: number, userData: any): Observable<any> {
  if (!this.http) throw new Error('HttpClient not available');

  //  Only send editable fields (not password, role, etc.)
  const body: any = {};
  if (userData.username) body.username = userData.username;
  if (userData.email) body.email = userData.email;
  if (userData.contactNumber !== undefined) body.contactNumber = userData.contactNumber;
  if (userData.skills !== undefined) body.skills = userData.skills;
  if (userData.bio !== undefined) body.bio = userData.bio;

  return this.http.put<any>(
    `${this.baseUrl}/api/auth/user/${userId}`,
    body,
    { headers: this.getAuthHeaders() }
  );
}

// ✅ Send OTP
sendOtp(username: string): Observable<any> {
  if (!this.http) throw new Error('HttpClient not available');

  return this.http.post(
    `${this.baseUrl}/api/auth/send-otp`,
    { username },
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  );
}

// ✅ Verify OTP (same response as login)
verifyOtp(username: string, otp: string): Observable<any> {
  if (!this.http) throw new Error('HttpClient not available');

  return this.http.post(
    `${this.baseUrl}/api/auth/verify-otp`,
    { username, otp },
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(
    tap((res: any) => {
      this.saveToken(res.token);
      this.setRole(res.role);

      if (res.userId) this.saveUserId(res.userId);
      if (res.username) localStorage.setItem('username', res.username);
    })
  );
}

}


