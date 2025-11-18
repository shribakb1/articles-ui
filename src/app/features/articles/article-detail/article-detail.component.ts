import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service'; // 👈 CHANGED
import { AuthService } from '../../../core/services/auth.service';
import { ArticleDto, UpdateArticleDto, RejectArticleDto, PublishArticleDto } from '../../../core/models/interfaces'; // 👈 CHANGED

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="article-detail-container">
      @if (loading) {
        <div class="loading">Loading article details...</div>
      } @else if (article) {
        <div class="article-detail-card">
          <div class="article-header">
            <div>
              <!-- Use title or fileName -->
              <h1>{{ article.title || article.fileName }}</h1>
              <div class="article-badges">
                <!-- Priority removed -->
                
                <!-- Status badge (adapted) -->
                <span class="status-badge" [class]="'status-' + article.status.toLowerCase()">
                  {{ article.status }}
                </span>
              </div>
            </div>
            <!-- Action buttons (adapted) -->
            <div class="article-actions">
              @if (canEditArticle()) {
                <button (click)="toggleEditMode()" class="btn btn-primary">
                  {{ editMode ? 'Cancel Edit' : 'Edit Title' }}
                </button>
              }
              @if (canPublishArticle()) {
                <button (click)="publishArticle()" class="btn btn-success">Publish Article</button>
              }
              @if (canRejectArticle()) {
                <button (click)="rejectArticle()" class="btn btn-danger">Reject Article</button>
              }
            </div>
          </div>

          <!-- Edit Mode (adapted) -->
          @if (editMode) {
            <form (ngSubmit)="updateArticle()" class="edit-form">
              <div class="form-group">
                <label for="title">Title</label>
                <input
                  type="text"
                  id="title"
                  [(ngModel)]="editDto.title"
                  name="title"
                  required
                  minlength="3"
                  maxlength="250"
                  class="input"
                />
              </div>
              
              <!-- Description and Priority forms removed -->
              
              <div class="form-actions">
                <button type="button" (click)="toggleEditMode()" class="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
              </div>
            </form>
          } @else {
            <!-- View Mode (adapted) -->
            <div class="article-content">
              <!-- No description section -->

              <section class="details-section">
                <h2>Article Details</h2>
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="label">Article ID:</span>
                    <span class="value">{{ article.id }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Author ID (User):</span>
                    <span class="value">{{ article.userId }}</span>
                  </div>
                  @if (article.moderatorId) {
                    <div class="detail-item">
                      <span class="label">Moderator ID (Admin):</span>
                      <span class="value">{{ article.moderatorId }}</span>
                    </div>
                  }
                  <div class="detail-item">
                    <span class="label">Original Filename:</span>
                    <span class="value">{{ article.fileName }}</span>
                  </div>
                  @if (article.storagePath) {
                    <div class="detail-item">
                      <span class="label">Storage Path:</span>
                      <span class="value">{{ article.storagePath }}</span>
                    </div>
                  }
                  @if (article.rejectionReason) {
                    <div class="detail-item rejection">
                      <span class="label">Rejection Reason:</span>
                      <span class="value">{{ article.rejectionReason }}</span>
                    </div>
                  }
                </div>
              </section>

              <!-- Status Update section removed -->

              <!-- Timeline (adapted) -->
              <section class="timeline-section">
                <h2>Article Timeline</h2>
                <div class="timeline">
                  <div class="timeline-item completed">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                      <h4>Uploaded (Pending)</h4>
                      <p>{{ article.createdAt | date:'medium' }}</p>
                    </div>
                  </div>
                  
                  @if (article.processingStartedAt) {
                    <div class="timeline-item processing">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <h4>Processing Started</h4>
                        <p>{{ article.processingStartedAt | date:'medium' }}</p>
                      </div>
                    </div>
                  }
                  
                  @if (article.processedAt) {
                    <div class="timeline-item awaiting">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <h4>Processed (Awaiting Approval)</h4>
                        <p>{{ article.processedAt | date:'medium' }}</p>
                      </div>
                    </div>
                  }
                  
                  @if (article.publishedAt) {
                    <div class="timeline-item published">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <h4>Published</h4>
                        <p>{{ article.publishedAt | date:'medium' }}</p>
                        <p class="moderator">By Admin: {{ article.moderatorId }}</p>
                      </div>
                    </div>
                  }
                  
                  @if (article.status === 'REJECTED' || article.status === 'FAILED') {
                    <div class="timeline-item rejected">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <h4>{{ article.status }}</h4>
                        <p>{{ article.rejectionReason }}</p>
                        @if (article.moderatorId) {
                          <p class="moderator">By Admin: {{ article.moderatorId }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </section>
            </div>
          }

          @if (error) {
            <div class="error-message">{{ error }}</div>
          }
        </div>
      } @else {
        <div class="not-found">
          <h2>Article not found</h2>
          <a routerLink="/articles" class="btn btn-primary">Back to Articles</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .article-detail-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .loading, .not-found {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .article-detail-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }

    .article-header h1 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .article-badges {
      display: flex;
      gap: 10px;
    }

    /* Priority styles REMOVED */

    .status-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    /* Status badge styles (adapted) */
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
    
    .article-actions {
      display: flex;
      gap: 10px;
    }

    .article-content section {
      margin-bottom: 40px;
    }

    .article-content h2 {
      color: #333;
      margin-bottom: 20px;
      font-size: 20px;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }

    .detail-item {
      display: flex;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .detail-item.rejection {
      background: #fff5f5;
      border: 1px solid #fed7d7;
    }

    .detail-item .label {
      font-weight: 600;
      color: #555;
      margin-right: 10px;
      min-width: 120px;
    }

    .detail-item .value {
      color: #333;
      word-break: break-all;
    }
    
    .detail-item.rejection .value {
      color: #c53030;
      font-weight: 500;
    }

    /* Status update section REMOVED */

    /* Timeline styles (adapted) */
    .timeline {
      position: relative;
      padding-left: 40px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }
    .timeline-item {
      position: relative;
      margin-bottom: 30px;
    }
    .timeline-marker {
      position: absolute;
      left: -30px;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e2e8f0;
      border: 2px solid white;
      box-shadow: 0 0 0 4px #f8f9fa;
    }
    .timeline-item.completed .timeline-marker { /* Uploaded */
      background: #667eea; 
    }
    .timeline-item.processing .timeline-marker {
      background: #3182ce;
    }
    .timeline-item.awaiting .timeline-marker {
      background: #ecc94b;
    }
    .timeline-item.published .timeline-marker {
      background: #48bb78;
    }
    .timeline-item.rejected .timeline-marker {
      background: #f56565;
    }
    
    .timeline-content h4 {
      margin: 0 0 5px 0;
      color: #333;
    }
    .timeline-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .timeline-content .moderator {
      margin-top: 5px;
      font-style: italic;
    }

    /* Edit form styles (adapted) */
    .edit-form {
      margin-top: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }
    .input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s;
      font-family: inherit;
    }
    .input:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    /* Button styles (unchanged) */
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
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
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
    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      margin-top: 20px;
    }
  `]
})
export class ArticleDetailComponent implements OnInit {
  article: ArticleDto | null = null;
  loading = true;
  error = '';
  editMode = false;
  
  // Adapted Edit DTO
  editDto: UpdateArticleDto = {
    articleId: '',
    title: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(id);
    }
  }

  get user() {
    return this.authService.currentUser();
  }

  loadArticle(id: string): void {
    this.loading = true;
    this.articleService.getArticle(id).subscribe({
      next: (article) => {
        this.article = article;
        // Pre-fill the edit DTO
        this.editDto = {
          articleId: article.id,
          title: article.title || article.fileName // Use fileName as fallback
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load article', error);
        this.error = 'Article not found or you do not have permission.';
        this.loading = false;
      }
    });
  }

  // --- Role-based action logic ---

  canEditArticle(): boolean {
    const user = this.user;
    // Only the 'User' (author) can edit, and only before it's approved
    return !!(user?.role === 'USER' && 
              this.article?.userId === user.id && 
              this.article?.status === 'AWAITING_APPROVAL'); // Or 'PENDING'
  }

  canPublishArticle(): boolean {
    const user = this.user;
    // Only 'Admin' can publish, and only when it's AWAITING_APPROVAL
    return !!(user?.role === 'ADMIN' && 
              this.article?.status === 'AWAITING_APPROVAL');
  }

  canRejectArticle(): boolean {
    const user = this.user;
    // Only 'Admin' can reject, and only when it's AWAITING_APPROVAL
    return !!(user?.role === 'ADMIN' && 
              this.article?.status === 'AWAITING_APPROVAL');
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode && this.article) {
      // Reset DTO on toggle
      this.editDto = {
        articleId: this.article.id,
        title: this.article.title || this.article.fileName
      };
    }
  }

  // --- Action Handlers (Adapted) ---

  updateArticle(): void {
    this.error = '';
    this.articleService.updateArticle(this.editDto).subscribe({
      next: (updatedArticle) => {
        this.article = updatedArticle;
        this.editMode = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to update article';
      }
    });
  }

  publishArticle(): void {
    if (!this.article || !confirm('Are you sure you want to publish this article?')) return;
    
    this.error = '';
    const dto: PublishArticleDto = { articleId: this.article.id };
    
    this.articleService.publishArticle(dto).subscribe({
      next: (updatedArticle) => {
        this.article = updatedArticle;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to publish article';
      }
    });
  }

  rejectArticle(): void {
    if (!this.article) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim().length === 0) {
      alert('A rejection reason is required.');
      return;
    }

    this.error = '';
    const dto: RejectArticleDto = { 
      articleId: this.article.id, 
      reason: reason 
    };
    
    this.articleService.rejectArticle(dto).subscribe({
      next: (updatedArticle) => {
        this.article = updatedArticle;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to reject article';
      }
    });
  }
}