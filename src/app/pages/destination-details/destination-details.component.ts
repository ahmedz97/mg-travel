import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { register } from 'swiper/element/bundle';
register();
import { SocialComponent } from '../../components/social/social.component';
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { FaqContentComponent } from '../../components/faq-content/faq-content.component';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-destination-details',
  standalone: true,
  imports: [
    CommonModule,
    TourCartComponent,
    FaqContentComponent,
    PartnerSliderComponent,
    BannerComponent,
    MakeTripFormComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './destination-details.component.html',
  styleUrl: './destination-details.component.scss',
})
export class DestinationDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('galleryCarousel') galleryCarousel!: ElementRef;

  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private _SeoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSwiper();
      }, 100);
    }
  }

  initializeSwiper() {
    if (
      this.galleryCarousel?.nativeElement &&
      this.destinationDetails?.gallery?.length > 0
    ) {
      const el = this.galleryCarousel.nativeElement;
      el.slidesPerView = 4;
      el.spaceBetween = 20;
      el.loop = true;
      el.autoplay = { delay: 1500, disableOnInteraction: false };
      el.pagination = { clickable: true };
      el.speed = 500;
      el.breakpoints = {
        0: { slidesPerView: 1 },
        400: { slidesPerView: 1 },
        586: { slidesPerView: 1 },
        740: { slidesPerView: 2 },
        940: { slidesPerView: 3 },
        1200: { slidesPerView: 4 },
      };
      el.initialize();
    }
  }

  getSanitizedHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  destinationDetails: any = {};
  destinationSlug: any = '';
  AllDestination: any[] = [];
  tours: any[] = [];
  filteredTours: any[] = [];

  layoutType: 'grid' | 'list' = 'grid';
  bannerTitle: string = '';

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: (param) => {
        this.destinationSlug = param.get('slug');
        // console.log('Destination Slug:', this.destinationSlug);

        this._DataService.getDestinationBySlug(this.destinationSlug).subscribe({
          next: (response) => {
            this.destinationDetails = response.data;
            // console.log(this.destinationSlug);
            this.showTours(this.destinationSlug);
            this.bannerTitle = this.destinationDetails.title;
            // console.log(
            //   'destination Details title:',
            //   this.destinationDetails.title
            // );
            // console.log('destination Details:', this.destinationDetails);

            // Update SEO
            this.updateTourSEO(response.data);

            // Initialize swiper after data loads
            if (isPlatformBrowser(this.platformId)) {
              setTimeout(() => {
                this.initializeSwiper();
              }, 100);
            }
          },
          error: (err) => {
            console.error('Error fetching destination details:', err);
          },
        });
      },
    });
    this.getDestinations();
    // this.showTours();
  }

  getDestinations() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        // console.log(res.data.data);
        this.AllDestination = res.data.data;
      },
    });
  }

  // to display tours which related this destination
  showTours(desSlug: string): void {
    this._DataService.getTours().subscribe({
      next: (response) => {
        this.tours = response.data.data;
        // console.log('Tours Data:', this.tours, this.tours.length);
        for (let i = 0; i < this.tours.length; i++) {
          const tour = this.tours[i];
          const tourDestinationSlugs = (tour.destinations ?? []).map((x: any) =>
            x?.slug != null ? String(x.slug).toLowerCase().trim() : ''
          );

          // check if any destination matches the slug
          if (tourDestinationSlugs.includes(desSlug.toLowerCase())) {
            this.filteredTours.push(tour);
          }
          // console.log(tourDestinationSlugs, this.filteredTours, desSlug);
          this.updateTourSEO(tour);
        }
      },
      error: (err) => {
        console.error('Error fetching tours:', err);
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
