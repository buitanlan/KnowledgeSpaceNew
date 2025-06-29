import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dob?: Date;
}

export interface CreateUserRequest {
  userName: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dob: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dob: string;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  functionId: string;
  functionName: string;
  commandId: string;
  commandName: string;
  roleId: string;
  roleName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserRoles(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/roles`);
  }

  assignRolesToUser(userId: string, roleNames: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/roles`, { roleNames });
  }

  removeRolesFromUser(userId: string, roleNames: string[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/roles`, { 
      body: { roleNames } 
    });
  }

  changeUserPassword(userId: string, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/change-password`, {
      currentPassword,
      newPassword
    });
  }
} 