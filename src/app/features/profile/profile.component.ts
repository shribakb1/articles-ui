import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BindingService } from '../../core/services/binding.service';
import { ArticleService } from '../../core/services/article.service'; // 👈 CHANGED
import { BindingDto, CreateBindingDto, UpdateBindingDto, ArticleDto, ArticleFilterDto } from '../../core/models/interfaces'; // 👈 CHANGED

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>User Profile</h1>
      </div>

      <div class="profile-content">
        <div class="section-card">
          <h2>Account Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Username:</span>
              <span class="value">{{ user()?.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">User ID:</span>
              <span class="value">{{ user()?.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">Role:</span>
              <span class="role-badge" [class]="'role-' + user()?.role?.toLowerCase()">
                {{ user()?.role }}
              </span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <h2>Email Notifications</h2>
          
          @if (binding) {
            <div class="binding-info">
              <div class="info-item">
                <span class="label">Current Email:</span>
                <span class="value">{{ binding.email }}</span>
              </div>
              
              @if (!editingBinding) {
                <div class="binding-actions">
                  <button (click)="startEditBinding()" class="btn btn-primary">
                    Update Email
                  </button>
                  <button (click)="deleteBinding()" class="btn btn-danger">
                    Remove Email
                  </button>
                </div>
              } @else {
                <form (ngSubmit)="updateBinding()" class="email-form">
                  <div class="form-group">
                    <input
                      type="email"
                      [(ngModel)]="updateBindingDto.email"
                      name="email"
                      placeholder="Enter new email"
                      required
                      class="input"
                    />
                  </div>
                  <div class="form-actions">
                    <button type="button" (click)="cancelEditBinding()" class="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                      Update
                    </button>
                  </div>
                </form>
              }
            </div>
          } @else {
            <div class="no-binding">
              <p>No email configured for notifications</p>
              
              @if (!addingBinding) {
                <button (click)="startAddBinding()" class="btn btn-primary">
                  Add Email
                </button>
              } @else {
                <form (ngSubmit)="createBinding()" class="email-form">
                  <div class="form-group">
                    <input
                      type="email"
                      [(ngModel)]="createBindingDto.email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      class="input"
                    />
                  </div>
                  <div class="form-actions">
                    <button type="button" (click)="cancelAddBinding()" class="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                      Add Email
                    </button>
                  </div>
                </form>
              }
            </div>
          }

          @if (bindingError) {
            <div class="error-message">{{ bindingError }}</div>
          }
        </div>

        <div class="section-card">
          <h2>Activity Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Articles</h3>
              <p class="stat-number">{{ statistics.total }}</p>
            </div>
            <div class="stat-card">
              <h3>In Progress</h3>
              <p class="stat-number">{{ statistics.active }}</p>
            </div>
            <div class="stat-card">
              <h3>Published</h3>
              <p class="stat-number">{{ statistics.published }}</p>
            </div>
            @if (user()?.role === 'ADMIN') {
              <div class="stat-card">
                <h3>Pending Approval</h3>
                <p class="stat-number">{{ statistics.pendingApproval }}</p>
              </div>
            }
          </div>
        </div>

        <div class="section-card">
          <h2>Recent Activity</h2>
          @if (recentArticles.length > 0) {
            <div class="activity-list">
              @for (article of recentArticles; track article.id) {
                <div class="activity-item">
                  <div class="activity-header">
                    <h4>{{ article.title || article.fileName }}</h4>
                    <span class="status-badge" [class]="'status-' + article.status.toLowerCase()">
                      {{ article.status }}
                    </span>
                  </div>
                  <p class="activity-date">{{ article.createdAt | date:'medium' }}</p>
                  <div class="activity-meta">
                    @if (article.moderatorId && user()?.role === 'USER') {
                      <span class="info-meta">Moderator: {{ article.moderatorId }}</span>
                    }
                    @if (article.userId && user()?.role === 'ADMIN') {
                      <span class="info-meta">Author: {{ article.userId }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="no-activity">No recent activity</p>
          }
        </div>

        <div class="section-card danger-zone">
          <h2>Danger Zone</h2>
          <div class="danger-content">
            <div class="danger-item">
              <div>
                <h3>Logout</h3>
                <p>Sign out of your account</p>
              </div>
              <button (click)="logout()" class="btn btn-danger">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .profile-header {
      margin-bottom: 30px;
    }
    .profile-header h1 {
      color: #333;
      margin: 0;
    }
    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .section-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .section-card h2 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 20px;
    }
    .info-grid {
      display: grid;
      gap: 15px;
    }
    .info-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .info-item .label {
      font-weight: 600;
      color: #555;
      margin-right: 15px;
      min-width: 120px;
    }
    .info-item .value {
      color: #333;
      font-size: 16px;
    }

    /* Role Badges (Adapted) */
    .role-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .role-user {
      background: #e3f2fd;
      color: #1565c0;
    }
    .role-admin {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .binding-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .binding-actions {
      display: flex;
      gap: 10px;
    }
    .no-binding {
      text-align: center;
      padding: 20px;
    }
    .no-binding p {
      color: #666;
      margin-bottom: 20px;
    }
    .email-form {
      margin-top: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    .input:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-actions {
      display: flex;
      gap: 10px;
    }

    /* Stats Section Styles (Unchanged) */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .activity-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .activity-header h4 {
      margin: 0;
      color: #333;
    }
    .activity-date {
      color: #666;
      font-size: 14px;
      margin: 0 0 10px 0;
    }
    .activity-meta {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .info-meta {
      font-size: 14px;
      color: #666;
    }
    .no-activity {
      text-align: center;
      color: #999;
      padding: 20px;
    }


    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
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

    .danger-zone {
      border: 2px solid #fed7d7;
    }
    .danger-zone h2 {
      color: #c53030;
    }
    .danger-content {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .danger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #fff5f5;
      border-radius: 8px;
    }
    .danger-item h3 {
      margin: 0 0 5px 0;
      color: #333;
    }
    .danger-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
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
    .btn-danger {
      background: #f56565;
      color: white;
    }
    .btn-danger:hover {
      background: #e53e3e;
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      margin-top: 15px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  binding: BindingDto | null = null;
  createBindingDto: CreateBindingDto = { email: '' };
  updateBindingDto: UpdateBindingDto = { email: '' };
  addingBinding = false;
  editingBinding = false;
  bindingError = '';
  
  recentArticles: ArticleDto[] = [];
  statistics = {
    total: 0,
    active: 0,
    published: 0,
    pendingApproval: 0
  };

  constructor(
    public authService: AuthService,
    private bindingService: BindingService,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.loadBinding();
    this.loadStatistics();
  }

  get user() {
    return this.authService.currentUser;
  }


  loadBinding(): void {
    this.bindingService.getBinding().subscribe({
      next: (binding) => {
        this.binding = binding;
      },
      error: (error) => {
        console.log('No binding found');
      }
    });
  }

  startAddBinding(): void {
    this.addingBinding = true;
    this.createBindingDto.email = '';
    this.bindingError = '';
  }

  cancelAddBinding(): void {
    this.addingBinding = false;
    this.createBindingDto.email = '';
    this.bindingError = '';
  }

  createBinding(): void {
    if (!this.createBindingDto.email) {
      this.bindingError = 'Please enter a valid email';
      return;
    }

    this.bindingError = '';
    this.bindingService.createBinding(this.createBindingDto).subscribe({
      next: (binding) => {
        this.binding = binding;
        this.addingBinding = false;
        this.createBindingDto.email = '';
      },
      error: (error) => {
        this.bindingError = error.error?.message || 'Failed to add email';
      }
    });
  }

  startEditBinding(): void {
    if (this.binding) {
      this.editingBinding = true;
      this.updateBindingDto.email = this.binding.email;
      this.bindingError = '';
    }
  }

  cancelEditBinding(): void {
    this.editingBinding = false;
    this.updateBindingDto.email = '';
    this.bindingError = '';
  }

  updateBinding(): void {
    if (!this.updateBindingDto.email) {
      this.bindingError = 'Please enter a valid email';
      return;
    }

    this.bindingError = '';
    this.bindingService.updateBinding(this.updateBindingDto).subscribe({
      next: (binding) => {
        this.binding = binding;
        this.editingBinding = false;
        this.updateBindingDto.email = '';
      },
      error: (error) => {
        this.bindingError = error.error?.message || 'Failed to update email';
      }
    });
  }

  deleteBinding(): void {
    if (confirm('Are you sure you want to remove your email? You will stop receiving notifications.')) {
      this.bindingService.deleteBinding().subscribe({
        next: () => {
          this.binding = null;
          this.bindingError = '';
        },
        error: (error) => {
          this.bindingError = error.error?.message || 'Failed to remove email';
        }
      });
    }
  }

  loadStatistics(): void {
    const user = this.user();
    if (!user) return;

    let filter: ArticleFilterDto = {};
    if (user.role === 'USER') {
      filter.userId = user.id;
    } else {
      filter.moderatorId = user.id;
    }

    this.articleService.filterArticles(filter).subscribe({
      next: (pagedResult) => {
        const articles = pagedResult.items;
        this.recentArticles = articles.slice(0, 5);
        this.statistics.total = articles.length;
        this.statistics.active = articles.filter(t => 
          ['PENDING', 'PROCESSING'].includes(t.status)
        ).length;
        this.statistics.published = articles.filter(t => 
          ['PUBLISHED'].includes(t.status)
        ).length;
        this.statistics.pendingApproval = articles.filter(t => 
          t.status === 'AWAITING_APPROVAL'
        ).length;
      },
      error: (error) => {
        console.error('Failed to load statistics', error);
      }
    });
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      window.location.href = '/login'; 
    }
  }
}