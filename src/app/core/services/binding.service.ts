import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BindingDto, CreateBindingDto, UpdateBindingDto } from '../models/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BindingService {
  private apiUrl = environment.API_BASE_URL;

  constructor(private http: HttpClient) {}

  createBinding(dto: CreateBindingDto): Observable<BindingDto> {
    return this.http.post<BindingDto>(`${this.apiUrl}/bindings`, dto);
  }

  getBinding(): Observable<BindingDto> {
    return this.http.get<BindingDto>(`${this.apiUrl}/bindings`);
  }

  updateBinding(dto: UpdateBindingDto): Observable<BindingDto> {
    return this.http.put<BindingDto>(`${this.apiUrl}/bindings`, dto);
  }

  deleteBinding(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bindings`);
  }
}