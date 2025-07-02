import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Permission {
  functionId: string;
  functionName: string;
  commandId: string;
  commandName: string;
  roleId: string;
  roleName: string;
}

export interface Function {
  id: string;
  name: string;
  parentId?: string;
  url?: string;
  icon?: string;
  sortOrder?: number;
}

export interface Command {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface AssignPermissionRequest {
  roleId: string;
  functionId: string;
  commandIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`);
  }

  getFunctions(): Observable<Function[]> {
    return this.http.get<Function[]>(`${this.apiUrl}/functions`);
  }

  getCommands(): Observable<Command[]> {
    return this.http.get<Command[]>(`${this.apiUrl}/commands`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  assignPermissions(request: AssignPermissionRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/permissions/assign`, request);
  }

  removePermissions(roleId: string, functionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/permissions/${roleId}/${functionId}`);
  }
}
