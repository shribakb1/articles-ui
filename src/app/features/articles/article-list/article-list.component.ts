import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service'; // 👈 CHANGED
import { AuthService } from '../../../core/services/auth.service';
import { ArticleDto, ArticleFilterDto, ArticleSortingDto, PaginationDto, PagedResult } from '../../../core/models/interfaces'; // 👈 CHANGED

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="article-list-container">
      <div class="header">
        <h1>Articles</h1>
        @if (user()?.role === 'USER') {
          <a routerLink="/articles/upload" class="btn btn-primary">Upload Article</a>
        }
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Status</label>
          <select [(ngModel)]="filter.status" (change)="applyFilters()">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="AWAITING_APPROVAL">Awaiting Approval</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Title</label>
          <input 
            type="text" 
            [(ngModel)]="filter.titleQuery" 
            (change)="applyFilters()" 
            placeholder="Search by title..."
            class="input-filter"
          />
        </div>

        <div class="filter-group">
          <label>Sort By</label>
          <select [(ngModel)]="sorting.sortBy" (change)="applyFilters()">
            <option value="CreatedAt">Created Date</option>
            <option value="Title">Title</option>
            <option value="Status">Status</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Order</label>
          <select [(ngModel)]="sorting.isDescending" (change)="applyFilters()">
            <option [value]="false">Ascending</option>
            <option [value]="true">Descending</option>
          </select>
        </div>
      </div>

      <div class="articles-grid">
        @for (article of articles; track article.id) {
          <div class="article-card">
            <div class="article-header">
              <h3>{{ article.title || article.fileName }}</h3>
              </div>
            
            <div class="article-meta">
              <span class="status-badge" [class]="'status-' + article.status.toLowerCase()">
                {{ article.status }}
              </span>
              <span class="date">{{ article.createdAt | date:'short' }}</span>
            </div>

            <div class="article-actions">
              <a [routerLink]="['/articles', article.id]" class="btn btn-sm btn-secondary">View</a>
              
              @if (canEditArticle(article)) {
                <a [routerLink]="['/articles/edit', article.id]" class="btn btn-sm btn-primary">Edit</a>
              }
              
              @if (canPublishArticle(article)) {
                <button (click)="publishArticle(article.id)" class="btn btn-sm btn-success">Publish</button>
              }
              
              @if (canRejectArticle(article)) {
                <button (click)="rejectArticle(article.id)" class="btn btn-sm btn-danger">Reject</button>
              }
            </div>
          </div>
        }
      </div>

      @if (articles.length === 0) {
        <div class="no-articles">
          <p>No articles found</p>
        </div>
      }

      <div class="pagination">
        <button 
          (click)="previousPage()" 
          [disabled]="pagination.pageNumber === 1"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <span>Page {{ pagination.pageNumber }} of {{ totalPages }}</span>
        <button 
          (click)="nextPage()" 
          [disabled]="pagination.pageNumber >= totalPages"
          class="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Renamed classes: task-list -> article-list, etc. */
    .article-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-group label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .filter-group select, .input-filter {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      font-family: inherit;
      font-size: 14px;
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .article-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      display: flex;
      flex-direction: column;
    }

    .article-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
    }

    .article-header h3 {
      flex: 1;
      margin: 0;
      color: #333;
    }

    .article-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .date {
      color: #999;
      font-size: 14px;
    }

    .article-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: auto; /* Pushes actions to the bottom */
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 14px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a67d8;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #cbd5e0;
    }

    .btn-success {
      background: #48bb78;
      color: white;
    }

    .btn-success:hover {
      background: #38a169;
    }

    /* Added .btn-danger for Reject */
    .btn-danger {
      background: #f56565;
      color: white;
    }

    .btn-danger:hover {
      background: #e53e3e;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Priority styles REMOVED */

    /* Status badges (updated for your statuses) */
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-pending,
    .status-processing {
      background: #bee3f8; /* Blue */
      color: #2c5282;
    }
    .status-awaiting_approval {
      background: #fff3cd; /* Yellow */
      color: #856404;
    }
    .status-published {
      background: #c6f6d5; /* Green */
      color: #22543d;
    }
    .status-rejected,
    .status-failed {
      background: #f8d7da; /* Red */
      color: #721c24;
    }

    .no-articles {
      text-align: center;
      padding: 60px;
      color: #999;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }
  `]
})
export class ArticleListComponent implements OnInit {
  articles: ArticleDto[] = [];
  filter: ArticleFilterDto = {};
  sorting: ArticleSortingDto = {
    sortBy: 'CreatedAt',
    isDescending: true
  };
  pagination: PaginationDto = {
    pageNumber: 1,
    pageSize: 10
  };
  
  // For pagination
  totalCount = 0;
  totalPages = 0;

  constructor(
    private articleService: ArticleService,
    public authService: AuthService,
    private router: Router // Added for navigation
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  get user() {
    return this.authService.currentUser;
  }

  loadArticles(): void {
    this.articleService.filterArticles(this.filter, this.sorting, this.pagination).subscribe({
      next: (pagedResult: PagedResult<ArticleDto>) => {
        this.articles = pagedResult.items;
        this.totalCount = pagedResult.totalCount;
        this.totalPages = pagedResult.totalPages;
        console.log('Loaded articles:', this.articles);
      },
      error: (error) => {
        console.error('Failed to load articles', error);
      }
    });
  }

  applyFilters(): void {
    this.pagination.pageNumber = 1;
    this.loadArticles();
  }

  nextPage(): void {
    if (this.pagination.pageNumber < this.totalPages) {
      this.pagination.pageNumber++;
      this.loadArticles();
    }
  }

  previousPage(): void {
    if (this.pagination.pageNumber > 1) {
      this.pagination.pageNumber--;
      this.loadArticles();
    }
  }

  // --- Role-based action logic ---

  canEditArticle(article: ArticleDto): boolean {
    const user = this.user();
    // Logic: Only the author ('User') can edit, and only when it's AWAITING_APPROVAL
    // (This matches your UpdateArticleMetadataCommand which an Admin might do)
    // Let's change this to: Admins can edit when it's AWAITING_APPROVAL
    return user?.role === 'ADMIN' && article.status === 'AWAITING_APPROVAL';
  }

  canPublishArticle(article: ArticleDto): boolean {
    const user = this.user();
    // Logic: Only 'Admin' can publish, and only when it's AWAITING_APPROVAL
    return user?.role === 'ADMIN' && article.status === 'AWAITING_APPROVAL';
  }

  canRejectArticle(article: ArticleDto): boolean {
    const user = this.user();
    // Logic: Only 'Admin' can reject, and only when it's AWAITING_APPROVAL
    return user?.role === 'ADMIN' && article.status === 'AWAITING_APPROVAL';
  }

  // --- Action handlers ---

  publishArticle(articleId: string): void {
    if (!confirm('Are you sure you want to publish this article?')) return;

    this.articleService.publishArticle({ articleId }).subscribe({
      next: () => {
        this.loadArticles(); // Refresh the list
      },
      error: (error) => {
        console.error('Failed to publish article', error);
      }
    });
  }

  rejectArticle(articleId: string): void {
    const reason = prompt('Please provide a reason for rejection:');
    
    if (reason && reason.length > 0) {
      this.articleService.rejectArticle({ articleId, reason }).subscribe({
        next: () => {
          this.loadArticles(); // Refresh the list
        },
        error: (error) => {
          console.error('Failed to reject article', error);
        }
      });
    } else {
      alert('Rejection reason is required.');
    }
  }
}