import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginDto, RegisterDto, TokenDto, User } from '../models/interfaces';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.API_BASE_URL;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  login(dto: LoginDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(`${this.apiUrl}/auth/login`, dto).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.loadUserFromToken();
      })
    );
  }

  register(dto: RegisterDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(`${this.apiUrl}/auth/register`, dto).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.loadUserFromToken();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.currentUser.set({
          id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        });
      } catch (error) {
        console.error('Invalid token', error);
        this.logout();
      }
    }
  }
}