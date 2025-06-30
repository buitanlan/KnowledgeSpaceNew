import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { environment } from '@environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  email: string;
  permissions: string[];
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = environment.apiUrl || 'https://localhost:5000/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_INFO_KEY = 'user_info';

  // Signals
  private readonly _isAuthenticated = signal<boolean>(this.hasValidToken());
  private readonly _userInfo = signal<UserInfo | null>(this.getUserInfoFromStorage());
  private readonly _loading = signal<boolean>(false);

  // Computed properties
  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly userInfo = computed(() => this._userInfo());
  readonly loading = computed(() => this._loading());
  readonly permissions = computed(() => this._userInfo()?.permissions || []);
  readonly roles = computed(() => this._userInfo()?.roles || []);

  constructor() {
    // Check token validity on service initialization
    this.checkTokenValidity();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._loading.set(true);

    return this.http.post<LoginResponse>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap((response) => {
        this.setAuthData(response);
        this._isAuthenticated.set(true);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
    this._isAuthenticated.set(false);
    this._userInfo.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasPermission(functionCode: string, action: string = 'View'): boolean {
    const permissions = this.permissions();
    const requiredPermission = `${functionCode}_${action}`;
    return permissions.includes(requiredPermission);
  }

  hasRole(roleName: string): boolean {
    const roles = this.roles();
    return roles.includes(roleName);
  }

  private setAuthData(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);

    // Decode JWT to get user info and permissions
    const userInfo = this.decodeToken(response.token);
    if (userInfo) {
      const fullUserInfo: UserInfo = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        permissions: userInfo.permissions || [],
        roles: userInfo.roles || []
      };

      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(fullUserInfo));
      this._userInfo.set(fullUserInfo);
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      const parsed = JSON.parse(decoded);

      return {
        permissions: parsed.permissions ? JSON.parse(parsed.permissions) : [],
        roles: parsed.role ? (Array.isArray(parsed.role) ? parsed.role : [parsed.role]) : []
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  private getUserInfoFromStorage(): UserInfo | null {
    const userInfoStr = localStorage.getItem(this.USER_INFO_KEY);
    if (!userInfoStr) return null;

    try {
      return JSON.parse(userInfoStr);
    } catch {
      return null;
    }
  }

  private checkTokenValidity(): void {
    if (!this.hasValidToken()) {
      this.logout();
    }
  }
}
