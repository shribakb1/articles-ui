import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ArticleService } from '../../core/services/article.service'; 
import { ArticleDto } from '../../core/models/interfaces'; 
import { ArticleFilterDto } from '../../core/models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="header">
        <h1>Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ user()?.username }}</span>
          <span class="role-badge">{{ user()?.role }}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Articles</h3>
          <p class="stat-number">{{ articles.length }}</p>
        </div>
        <div class="stat-card">
          <h3>In Progress</h3>
          <p class="stat-number">{{ getInProgressCount() }}</p>
        </div>
        <div class="stat-card">
          <h3>Published</h3>
          <p class="stat-number">{{ getPublishedCount() }}</p>
        </div>
        <div class="stat-card">
          <h3>Pending Approval</h3>
          <p class="stat-number">{{ getPendingApprovalCount() }}</p>
        </div>
      </div>

      <div class="actions">
        @if (user()?.role === 'USER') {
          <a routerLink="/articles/upload" class="btn btn-primary">Upload New Article</a>
        }
        @if (user()?.role === 'ADMIN') {
          <a routerLink="/articles" class="btn btn-primary">Review Articles</a>
        }
        <a routerLink="/articles" class="btn btn-secondary">View All Articles</a>
      </div>

      <div class="recent-articles">
        <h2>Recent Articles</h2>
        <div class="article-list">
          @for (article of recentArticles; track article.id) {
            <div class="article-card">
              <div class="article-header">
                <h3>{{ article.title || article.fileName }}</h3>
                </div>
              <div class="article-footer">
                <span class="status-badge" [class]="'status-' + article.status.toLowerCase()">
                  {{ article.status }}
                </span>
                <a [routerLink]="['/articles', article.id]" class="view-link">View Details →</a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* General styles (mostly unchanged) */
    .dashboard {
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
    .user-info {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .role-badge {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .stat-card h3 {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
    .actions {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
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

    /* Renamed to 'recent-articles' */
    .recent-articles {
      margin-top: 40px;
    }
    .recent-articles h2 {
      margin-bottom: 20px;
    }
    .article-list {
      display: grid;
      gap: 20px;
    }
    .article-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .article-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px; /* Added margin */
    }

    /* Priority styles are REMOVED */

    /* Status badges (updated for your statuses) */
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize; /* Makes 'PENDING' look like 'Pending' */
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

    .view-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .view-link:hover {
      text-decoration: underline;
    }
  `]
})
export class DashboardComponent implements OnInit {
  articles: ArticleDto[] = [];       
  recentArticles: ArticleDto[] = []; 

  constructor(
    public authService: AuthService,
    private articleService: ArticleService 
  ) {}

  ngOnInit(): void {
    this.loadArticles(); 
  }

  get user() {
    return this.authService.currentUser;
  }

  loadArticles(): void {
    const user = this.user();
    if (!user) return;

    
    let filter: ArticleFilterDto = {}; 

    if (user.role === 'USER') {
      filter.userId = user.id;
    } else {
      filter.status = 'AWAITING_APPROVAL'; 
    }

    this.articleService.filterArticles(filter).subscribe({
      next: (pagedResult) => {
        this.articles = pagedResult.items;
        this.recentArticles = pagedResult.items.slice(0, 5);
      },
      error: (error) => {
        console.error('Failed to load articles', error);
      }
    });
  }


  getInProgressCount(): number {
    return this.articles.filter(t => 
      ['PENDING', 'PROCESSING'].includes(t.status)
    ).length;
  }

  getPublishedCount(): number {
    return this.articles.filter(t => 
      ['PUBLISHED'].includes(t.status)
    ).length;
  }

  getPendingApprovalCount(): number {
    return this.articles.filter(t => t.status === 'AWAITING_APPROVAL').length;
  }
}