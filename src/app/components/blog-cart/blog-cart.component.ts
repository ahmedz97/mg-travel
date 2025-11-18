import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-blog-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './blog-cart.component.html',
  styleUrl: './blog-cart.component.scss',
})
export class BlogCartComponent {
  constructor(
    private _DataService: DataService,
    private sanitizer: DomSanitizer
  ) {}
  @Input() blogs: any[] = []; // Used for displaying blogs passed from parent
  @Output() blogsLoaded = new EventEmitter<any[]>(); // Used only when fetching from API

  get safeBlogs(): any[] {
    return Array.isArray(this.blogs) ? this.blogs : [];
  }

  getSanitizedHtml(content: string): SafeHtml {
    if (!content) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    
    // Clean up HTML to prevent hydration mismatches
    let cleanedContent = content;
    
    // Remove problematic nested paragraph tags that cause hydration issues
    cleanedContent = cleanedContent.replace(/<p[^>]*>/gi, '<div>').replace(/<\/p>/gi, '</div>');
    
    // Remove any remaining problematic tags that could cause structure issues
    cleanedContent = cleanedContent.replace(/<(h[1-6]|div|span)[^>]*>/gi, '<span>').replace(/<\/(h[1-6]|div|span)>/gi, '</span>');
    
    // Ensure we don't have empty tags
    cleanedContent = cleanedContent.replace(/<span><\/span>/gi, '');
    
    return this.sanitizer.bypassSecurityTrustHtml(cleanedContent);
  }

  getPlainText(content: string): string {
    if (!content) {
      return '';
    }
    // Strip all HTML tags and return plain text
    return content.replace(/<[^>]*>/g, '');
  }

  ngOnInit(): void {
    // Ensure blogs is always an array
    if (!this.blogs) {
      this.blogs = [];
    }

    // If blogs not passed via input, fetch from API
    if (!this.blogs.length) {
      this._DataService.getBlogs().subscribe({
        next: (res) => {
          const data = res?.data?.data ?? res ?? [];
          this.blogs = Array.isArray(data) ? data : [];
          this.blogsLoaded.emit(this.blogs); // Emit to parent
          console.log('Blogs loaded:', this.blogs);
        },
        error: (err) => {
          console.log('Error loading blogs:', err);
          this.blogs = []; // Ensure blogs is always an array even on error
        },
      });
    }
  }
}
