import { Injectable } from '@angular/core';
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

  // Properties
  private token: string | null = null;
  private baseUrl: string = environment.apiUrl;   

  constructor(private http: HttpClient) {}

 
  // Helper: build headers
 
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

  // registerUser(user)
  // POST /api/auth/register
 
  registerUser(user: User): Observable<User> {
    return this.http.post<User>(
      `${this.baseUrl}/api/auth/register`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  // login(loginRequest)
  // POST /api/auth/login
  // returns Observable<LoginResponse>

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/api/auth/login`,
      loginRequest,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap((res: LoginResponse) => {
        // store token + role + userId if present
        this.saveToken(res.token);
        this.setRole(res.role as Role);

        // some backends return userId; if not, ignore
        const anyRes: any = res as any;
        if (anyRes.userId !== undefined && anyRes.userId !== null) {
          this.saveUserId(Number(anyRes.userId));
        }
      })
    );
  }

 
  // saveToken(token)
  // store token in localStorage + in private variable
  
  saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // getToken()
  // retrieve token from localStorage

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

 
  // setRole(role) / getRole()
 
  setRole(role: Role): void {
    localStorage.setItem('role', role);
  }

  getRole(): Role | null {
    const role = localStorage.getItem('role');
    return role ? (role as Role) : null;
  }


  // saveUserId(userId) / getUserId()
  
  saveUserId(userId: number): void {
    localStorage.setItem('userId', String(userId));
  }

  getUserId(): number | null {
    const val = localStorage.getItem('userId');
    return val ? Number(val) : null;
  }

  // getLoginStatus()
  // return true if token exists
  
  getLoginStatus(): boolean {
    return !!this.getToken();
  }

  // logout()
  // remove token, role, userId
 
  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }

  // -----------------------------
  // role checks
  // -----------------------------
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  // NOTE: spec says Manager = CLIENT
  isManager(): boolean {
    return this.getRole() === 'CLIENT';
  }

  // NOTE: spec says Customer = FREELANCER
  isCustomer(): boolean {
    return this.getRole() === 'FREELANCER';
  }

 
  // getLoggedInUser(userId)

  getLoggedInUser(userId: number): Observable<User> {
    return this.http.get<User>(
      `${this.baseUrl}/api/auth/user/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // getUsers()

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.baseUrl}/api/auth`,
      { headers: this.getAuthHeaders() }
    );
  }
}
