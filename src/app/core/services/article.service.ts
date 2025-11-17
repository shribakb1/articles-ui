import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ArticleDto,
  UpdateArticleDto,
  PublishArticleDto,
  RejectArticleDto,
  ArticleFilterDto,
  ArticleSortingDto,
  PaginationDto,
  PagedResult 
} from '../models/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = environment.API_BASE_URL; 

  constructor(private http: HttpClient) {}

  uploadArticle(file: File): Observable<ArticleDto> {
    const formData = new FormData();
    formData.append('file', file, file.name); 
    
    return this.http.post<ArticleDto>(`${this.apiUrl}/articles/upload`, formData);
  }

  updateArticle(dto: UpdateArticleDto): Observable<ArticleDto> {
    return this.http.put<ArticleDto>(`${this.apiUrl}/articles`, dto);
  }

  publishArticle(dto: PublishArticleDto): Observable<ArticleDto> {
    return this.http.post<ArticleDto>(`${this.apiUrl}/articles/publish`, dto);
  }

  rejectArticle(dto: RejectArticleDto): Observable<ArticleDto> {
    return this.http.post<ArticleDto>(`${this.apiUrl}/articles/reject`, dto);
  }

  getArticle(id: string): Observable<ArticleDto> {
    return this.http.get<ArticleDto>(`${this.apiUrl}/articles/${id}`);
  }

  filterArticles(
    filter?: ArticleFilterDto,
    sorting?: ArticleSortingDto,
    pagination?: PaginationDto
  ): Observable<PagedResult<ArticleDto>> { 
    let params = new HttpParams();
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    
    if (sorting) {
      params = params.set('sortBy', sorting.sortBy);
      params = params.set('isDescending', sorting.isDescending.toString());
    }
    
    if (pagination) {
      params = params.set('pageNumber', pagination.pageNumber.toString());
      params = params.set('pageSize', pagination.pageSize.toString());
    }
    
    return this.http.get<PagedResult<ArticleDto>>(`${this.apiUrl}/articles/filter`, { params });
  }
}