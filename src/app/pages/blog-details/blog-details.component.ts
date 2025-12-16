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
        // console.log(param);
        this.blogParam = param.get('slug');
        // console.log('blog param:', this.blogParam);

        if (!isNaN(Number(this.blogParam))) {
          this._DataService.getCategoriesBlog(this.blogParam).subscribe({
            next: (response) => {
              // console.log(response.data);
              this.blogListById = response.data;
              this.bannerTitle = this.blogListById.title;
              // console.log(this.bannerTitle);
              this.isListId = true;
              response.data.created_at = this.formatDate(
                response.data.created_at
              );
            },
          });
        } else {
          this._DataService.getBlogs(this.blogParam).subscribe({
            next: (response) => {
              // console.log(response.data);
              this.blogDetails = response.data;
              this.bannerTitle = this.blogDetails.title;
              // console.log(this.bannerTitle);

              this.isListId = false;
              response.data.created_at = this.formatDate(
                response.data.created_at
              );
              this.tags = this.blogDetails.tags
                .split(',')
                .map((name: any) => name.trim());

              // this.writeReview.patchValue({ tour_id: response.data.id });

              // Update SEO
              this.updateTourSEO(response.data);
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
      // console.log(this.writeReview.value);
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
        this.updateTourSEO(this.blogs);
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

  updateTourSEO(tour: any): void {
    // Extract SEO data from API if available
    const seoData: any = {};
    if (tour.seo) {
      if (tour.seo.meta_title) seoData.meta_title = tour.seo.meta_title;
      if (tour.seo.meta_description)
        seoData.meta_description = tour.seo.meta_description;
      if (tour.seo.meta_keywords)
        seoData.meta_keywords = tour.seo.meta_keywords;
      if (tour.seo.og_title) seoData.og_title = tour.seo.og_title;
      if (tour.seo.og_description)
        seoData.og_description = tour.seo.og_description;
      if (tour.seo.og_image) seoData.og_image = tour.seo.og_image;
      if (tour.seo.og_type) seoData.og_type = tour.seo.og_type;
      if (tour.seo.twitter_title)
        seoData.twitter_title = tour.seo.twitter_title;
      if (tour.seo.twitter_description)
        seoData.twitter_description = tour.seo.twitter_description;
      if (tour.seo.twitter_card) seoData.twitter_card = tour.seo.twitter_card;
      if (tour.seo.twitter_image)
        seoData.twitter_image = tour.seo.twitter_image;
      if (tour.seo.canonical) seoData.canonical = tour.seo.canonical;
      if (tour.seo.robots) seoData.robots = tour.seo.robots;
      if (tour.seo.structure_schema)
        seoData.structure_schema = tour.seo.structure_schema;
    }

    const tourImage =
      tour.seo?.og_image ||
      tour.image ||
      tour.gallery?.[0]?.image ||
      '/assets/image/logo-MG-Travel.webp';
    const tourDescription =
      tour.seo?.meta_description ||
      tour.seo?.og_description ||
      tour.short_description ||
      tour.description ||
      `Book ${tour.title} tour with MG Travel. Experience amazing destinations and create unforgettable memories.`;

    const fallbackTitle =
      tour.seo?.meta_title || tour.seo?.og_title || `${tour.title} - MG Travel`;

    this._SeoService.updateSeoData(
      seoData,
      fallbackTitle,
      tourDescription.substring(0, 160),
      tourImage
    );
  }
}
