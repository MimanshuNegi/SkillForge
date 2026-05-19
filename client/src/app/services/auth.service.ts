import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../model/loginrequest';
import { Role, User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private baseUrl: string = environment.apiUrl;

  constructor(@Optional() private http?: HttpClient) { }

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

  //   REGISTER (unchanged)
  registerUser(user: User): Observable<User> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.post<User>(
      `${this.baseUrl}/api/auth/register`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  // 🔥 🔥 STEP 1: LOGIN (PASSWORD CHECK + SEND OTP)
  // ❌ NO TOKEN HERE
  login(loginRequest: LoginRequest): Observable<any> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.post(
      `${this.baseUrl}/api/auth/login`,
      loginRequest,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }

  // 🔥 🔥 STEP 2: VERIFY OTP → LOGIN SUCCESS
  verifyOtp(username: string, otp: string): Observable<any> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.post(
      `${this.baseUrl}/api/auth/verify-otp`,
      { username, otp },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      tap((res: any) => {

        //   SAVE TOKEN HERE ONLY (FINAL AUTH)
        this.saveToken(res.token);
        this.setRole(res.role);

        if (res.userId) {
          this.saveUserId(Number(res.userId));
        }

        if (res.username) {
          sessionStorage.setItem('username', res.username);
        }
      })
    );
  }

  //   TOKEN MANAGEMENT
  saveToken(token: string): void {
    this.token = token;
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token || sessionStorage.getItem('token');
  }

  setRole(role: Role): void {
    sessionStorage.setItem('role', role);
  }

  getRole(): Role | null {
    const role = sessionStorage.getItem('role');
    return role ? (role as Role) : null;
  }

  saveUserId(userId: number): void {
    sessionStorage.setItem('userId', String(userId));
  }

  getUserId(): number | null {
    const val = sessionStorage.getItem('userId');
    return val ? Number(val) : null;
  }

  getLoginStatus(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.token = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
  }

  //   ROLE HELPERS
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isManager(): boolean {
    return this.getRole() === 'CLIENT';
  }

  isCustomer(): boolean {
    return this.getRole() === 'FREELANCER';
  }

  //   GET USER
  getLoggedInUser(userId: number): Observable<User> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.get<User>(
      `${this.baseUrl}/api/auth/user/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  //   GET USERS
  getUsers(): Observable<User[]> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.get<User[]>(
      `${this.baseUrl}/api/auth`,
      { headers: this.getAuthHeaders() }
    );
  }

  //   DELETE USER
  deleteUser(userId: number): Observable<any> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.delete(
      `${this.baseUrl}/api/auth/user/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  //   UPDATE USER
  updateUser(userId: number, userData: any): Observable<any> {
    if (!this.http) throw new Error('HttpClient not available');

    const body: any = {};
    if (userData.username) body.username = userData.username;
    if (userData.email) body.email = userData.email;
    if (userData.contactNumber !== undefined) body.contactNumber = userData.contactNumber;
    if (userData.skills !== undefined) body.skills = userData.skills;
    if (userData.bio !== undefined) body.bio = userData.bio;

    return this.http.put(
      `${this.baseUrl}/api/auth/user/${userId}`,
      body,
      { headers: this.getAuthHeaders() }
    );
  }
  //  Check if username is taken (no auth needed)
  checkUsername(username: string): Observable<{ exists: boolean }> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.get<{ exists: boolean }>(
      `${this.baseUrl}/api/auth/check-username?username=${encodeURIComponent(username)}`
    );
  }

  //  Check if email is taken (no auth needed)
  checkEmail(email: string): Observable<{ exists: boolean }> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.get<{ exists: boolean }>(
      `${this.baseUrl}/api/auth/check-email?email=${encodeURIComponent(email)}`
    );
  }

  //  Registration OTP — Step 1: Validate + Send OTP
  registerSendOtp(user: User): Observable<any> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.post(
      `${this.baseUrl}/api/auth/register/send-otp`,
      user,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }

  //  Registration OTP — Step 2: Verify OTP + Create User
  registerVerifyOtp(userData: any, otp: string): Observable<any> {
    if (!this.http) throw new Error('HttpClient not available');

    return this.http.post(
      `${this.baseUrl}/api/auth/register/verify-otp`,
      { ...userData, otp },
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }

  //  Forgot Password — Step 1: Send OTP
forgotPasswordSendOtp(username: string): Observable<any> {
  if (!this.http) throw new Error('HttpClient not available');

  return this.http.post(
    `${this.baseUrl}/api/auth/forgot-password/send-otp`,
    { username },
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  );
}

//  Forgot Password — Step 2: Verify OTP + Reset Password
forgotPasswordReset(username: string, otp: string, newPassword: string): Observable<any> {
  if (!this.http) throw new Error('HttpClient not available');

  return this.http.post(
    `${this.baseUrl}/api/auth/forgot-password/reset`,
    { username, otp, newPassword },
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  );
}

}
