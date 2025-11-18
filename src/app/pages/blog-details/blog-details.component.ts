import { Component, OnInit } from '@angular/core';
import { BannerComponent } from '../../components/banner/banner.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SocialComponent } from '../../components/social/social.component';
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [
    BannerComponent,
    RouterLink,
    CommonModule,
    SocialComponent,
    RouterLink,
    ReactiveFormsModule,
    MakeTripFormComponent,
  ],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss',
})
export class BlogDetailsComponent implements OnInit {
  bannerTitle: string = '';

  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private toaster: ToastrService,
    private sanitizer: DomSanitizer,
    private _SeoService: SeoService
  ) {}

  getSanitizedHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  // slug or id
  blogParam: any = '';
  blogDetails: any = {};
  tags: any = [];
  blogs: any = [];
  blogListById: any = {};
  isListId: boolean = false;
  writeReview!: FormGroup;
  isLoading: boolean = false;
  blogCategories: any = [];

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: (param) => {
        console.log(param);
        this.blogParam = param.get('slug');
        // console.log('blog param:', this.blogParam);

        if (!isNaN(Number(this.blogParam))) {
          this._DataService.getCategoriesBlog(this.blogParam).subscribe({
            next: (response) => {
              console.log(response.data);
              this.blogListById = response.data;
              this.bannerTitle = this.blogListById.title;
              console.log(this.bannerTitle);
              this.isListId = true;
              response.data.created_at = this.formatDate(
                response.data.created_at
              );
            },
          });
        } else {
          this._DataService.getBlogs(this.blogParam).subscribe({
            next: (response) => {
              console.log(response.data);
              this.blogDetails = response.data;
              this.bannerTitle = this.blogDetails.title;
              console.log(this.bannerTitle);

              this.isListId = false;
              response.data.created_at = this.formatDate(
                response.data.created_at
              );
              this.tags = this.blogDetails.tags
                .split(',')
                .map((name: any) => name.trim());

              // this.writeReview.patchValue({ tour_id: response.data.id });
              
              // Update SEO
              this.updateBlogSEO(response.data);
            },
          });
        }
      },
    });
    this.showBlogs();
    this.showCategoriesBlog();
    this.writeReview = new FormGroup({
      reviewer_name: new FormControl(''),
      rate: new FormControl('', [
        Validators.required,
        Validators.min(0),
        Validators.max(5),
      ]),
      // confirm: new FormControl(''),
      content: new FormControl(''),
      tour_id: new FormControl(null),
    });
  }

  getWriteReview() {
    if (this.writeReview.valid) {
      console.log(this.writeReview.value);
      this.isLoading = true;

      //untill api is not ready and mos3an confirm it
      // this._DataService.postReviews(this.writeReview.value ).subscribe({
      //   next: (response) => {
      //     console.log(response);
      //     if (response.status == true) {
      //       this.toaster.success(response.message);
      //       this.isLoading = false;
      //     }
      //   },
      // });
      this.writeReview.reset();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  }

  showBlogs() {
    this._DataService.getBlogs().subscribe({
      next: (res) => {
        // console.log(res.data.data);
        this.blogs = res.data.data;
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  showCategoriesBlog() {
    this._DataService.getCategoriesBlog().subscribe({
      next: (res) => {
        // console.log(res.data.data);
        this.blogCategories = res.data.data;
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  updateBlogSEO(blog: any): void {
    const baseUrl = 'https://egygo-travel.com';
    const blogImage = blog.image || '';
    const blogDescription = blog.short_description || blog.description || `Read ${blog.title} on EGYGO Travel blog. Travel tips, guides, and insights.`;
    const tags = blog.tags ? blog.tags.split(',').map((t: string) => t.trim()).join(', ') : '';
    const keywords = `${blog.title}, travel blog, ${tags}, travel tips, Egypt travel`.toLowerCase();

    this._SeoService.updateSEO({
      title: `${blog.title} | EGYGO Travel Blog`,
      description: blogDescription.substring(0, 160),
      keywords: keywords,
      image: blogImage,
      url: `${baseUrl}/blog/${blog.slug}`,
      type: 'article',
      author: 'EGYGO Travel',
      publishedTime: blog.created_at || new Date().toISOString(),
      modifiedTime: blog.updated_at || blog.created_at || new Date().toISOString(),
    });

    // Add structured data
    const structuredData = this._SeoService.generateBlogStructuredData(blog, baseUrl);
    this._SeoService.updateSEO({ structuredData });
  }
}
