import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Function {
  id: string;
  name: string;
  parentId?: string;
  url?: string;
  icon?: string;
  sortOrder?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/functions`;

  getFunctions(): Observable<Function[]> {
    return this.http.get<Function[]>(this.apiUrl);
  }

  getFunctionById(id: string): Observable<Function> {
    return this.http.get<Function>(`${this.apiUrl}/${id}`);
  }

  createFunction(functionData: Function): Observable<Function> {
    return this.http.post<Function>(this.apiUrl, functionData);
  }

  updateFunction(id: string, functionData: Function): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, functionData);
  }

  deleteFunction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 