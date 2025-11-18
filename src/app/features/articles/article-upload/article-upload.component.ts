import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { ArticleDto } from '../../../core/models/interfaces';

@Component({
  selector: 'app-article-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="upload-article-container">
      <div class="form-card">
        <h1>Upload New Article</h1>
        
        <form (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label for="articleFile">Article File *</label>
            <input
              type="file"
              id="articleFile"
              name="articleFile"
              (change)="onFileSelected($event)"
              required
              class="input-file"
              accept=".pdf,.doc,.docx"
            />
            
            <!-- Show the name of the selected file -->
            @if (selectedFile) {
              <div class="file-name-display">
                Selected: {{ selectedFile.name }}
              </div>
            }
            <span class="hint">Select a file to upload (e.g., PDF, DOCX)</span>
          </div>

          @if (error) {
            <div class="error-message">{{ error }}</div>
          }

          <div class="form-actions">
            <button type="button" (click)="cancel()" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="loading || !selectedFile">
              {{ loading ? 'Uploading...' : 'Upload Article' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Re-using the same style structure */
    .upload-article-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      margin-bottom: 30px;
      color: #333;
    }

    .form-group {
      margin-bottom: 25px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }

    /* Style for the file input */
    .input-file {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      font-family: inherit;
    }

    .input-file::file-selector-button {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      background-color: #f1f5f9;
      color: #333;
      cursor: pointer;
      margin-right: 10px;
    }

    .file-name-display {
      margin-top: 10px;
      font-style: italic;
      color: #555;
    }

    .hint {
      display: block;
      margin-top: 4px;
      font-size: 13px;
      color: #999;
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ArticleUploadComponent {
  // We don't need a DTO, we just need the file itself
  selectedFile: File | null = null;
  loading = false;
  error = '';

  constructor(
    private articleService: ArticleService,
    private router: Router
  ) {}

  /**
   * Called when the user selects a file from the input.
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    
    if (file) {
      this.selectedFile = file;
      this.error = ''; // Clear any previous errors
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.articleService.uploadArticle(this.selectedFile!).subscribe({
      next: (createdArticle) => {
        this.router.navigate(['/articles', createdArticle.id]);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to upload article. Please try again.';
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.selectedFile) {
      this.error = 'Please select a file to upload';
      return false;
    }

    // You could add more validation here (file size, type)
    // if (!this.selectedFile.type.includes('pdf')) {
    //   this.error = 'Only PDF files are allowed';
    //   return false;
    // }

    return true;
  }

  cancel(): void {
    this.router.navigate(['/dashboard']); 
  }
}