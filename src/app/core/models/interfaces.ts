// DTOs for authentication
export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  role: 'MILITARY' | 'VOLUNTEER';
}

export interface TokenDto {
  token: string;
}

export interface PaginationDto {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// DTOs for bindings
export interface CreateBindingDto {
  email: string;
}

export interface UpdateBindingDto {
  email: string;
}

export interface BindingDto {
  identityId: string;
  email: string;
}

// User interface
export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

// --- Article DTOs ---
export interface UpdateArticleDto {
  articleId: string;
  title: string;
}

export interface PublishArticleDto {
  articleId: string;
}

export interface RejectArticleDto {
  articleId: string;
  reason: string;
}

export interface ArticleDto {
  id: string;
  userId: string;       
  moderatorId?: string;
  fileName: string;     
  title?: string;
  status: 'PENDING' | 'PROCESSING' | 'AWAITING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'FAILED';
  storagePath?: string;
  rejectionReason?: string;
  
  createdAt: Date;
  processingStartedAt?: Date;
  processedAt?: Date;
  publishedAt?: Date;
}

export interface ArticleFilterDto {
  status?: 'PENDING' | 'AWAITING_APPROVAL' | 'PUBLISHED' | 'REJECTED';
  userId?: string;     
  moderatorId?: string;
  titleQuery?: string;   
  createdAtFrom?: Date;
  createdAtTo?: Date;
}

export interface ArticleSortingDto {
  sortBy: 'CreatedAt' | 'Title' | 'Status';
  isDescending: boolean;
}