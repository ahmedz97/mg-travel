import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { register } from 'swiper/element/bundle';
register();
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import { Itour } from '../../core/interfaces/itour';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../core/services/booking.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { FaqContentComponent } from '../../components/faq-content/faq-content.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BannerComponent } from '../../components/banner/banner.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatExpansionModule,
    FaqContentComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    BannerComponent,
    MakeTripFormComponent,
    RouterLink,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.scss',
})
export class TourDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('tourGalleryCarousel') tourGalleryCarousel!: ElementRef;

  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private toaster: ToastrService,
    private _BookingService: BookingService,
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
      this.tourGalleryCarousel?.nativeElement &&
      this.tourGallery.length > 0
    ) {
      const el = this.tourGalleryCarousel.nativeElement;
      el.slidesPerView = 1;
      el.spaceBetween = 0;
      el.loop = true;
      el.autoplay = { delay: 1500, disableOnInteraction: false };
      el.speed = 2000;
      el.navigation = false;

      el.initialize();
    }
  }

  getSanitizedHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  bannerTitle: string = '';
  panelOpenState = false;

  tourData: Itour | null = null;

  tourDetailsSlug: string = '';

  tourItenary: any[] = [];
  tourGallery: any[] = [];
  tourIncluded: any[] = [];
  tourExcluded: any[] = [];
  tourReviews: any[] = [];

  adultPrice: number = 0;
  childPrice: number = 0;
  infantPrice: number = 0;
  totalPrice: number = 0;

  faqsList: any[] = [{}];

  bookingFormData!: FormGroup;

  writeReview!: FormGroup;
  isLoading: boolean = false;

  phoneNumber: any;
  userEmail: any;

  ngOnInit(): void {
    this.writeReview = new FormGroup({
      reviewer_name: new FormControl(''),
      rate: new FormControl('', [
        Validators.required,
        Validators.min(0),
        Validators.max(5),
      ]),
      confirm: new FormControl(''),
      content: new FormControl(''),
      tour_id: new FormControl(null),
    });

    this.bookingFormData = new FormGroup({
      start_date: new FormControl(),
      adults: new FormControl(1),
      children: new FormControl(0),
      infants: new FormControl(0),
      tour_id: new FormControl(null),
    });

    this._ActivatedRoute.paramMap.subscribe({
      next: (param) => {
        this.tourDetailsSlug = param.get('slug') ?? '';
        // console.log(this.tourDetailsSlug);
        this.getTour(this.tourDetailsSlug);
      },
    });

    this.getFAQs();
    this.getSettings();
  }

  getTour(slug: string) {
    this._DataService.getToursSlug(slug).subscribe({
      next: (response) => {
        // console.log(response.data);
        this.tourData = response.data;
        // Keep itinerary in the same order as from dashboard
        this.tourItenary = response.data?.days ? [...response.data.days] : [];
        // Sort by display_order if it exists in reverse order, otherwise keep original order
        if (
          this.tourItenary.length > 0 &&
          this.tourItenary[0].display_order !== undefined
        ) {
          this.tourItenary.sort((a: any, b: any) => {
            const orderA = a.display_order ?? 0;
            const orderB = b.display_order ?? 0;
            return orderB - orderA; // Reverse order
          });
        } else {
          // Reverse the array if no display_order
          this.tourItenary.reverse();
        }
        this.tourGallery = response.data?.gallery;
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.initializeSwiper();
          }, 100);
        }
        // console.log(this.tourData);

        this.bannerTitle = this.tourData?.title || '?';
        // console.log(this.bannerTitle);

        this.tourIncluded = this.tourData?.included
          ? this.tourData.included.split(',')
          : [];
        this.tourExcluded = this.tourData?.excluded
          ? this.tourData.excluded.split(',')
          : [];

        if (
          this.tourData?.destinations &&
          Array.isArray(this.tourData.destinations)
        ) {
          this.tourData.destinationsTitle = this.tourData.destinations
            .map((x: any) => x.title)
            .join(',');
          // console.log(this.tourData.destinationsTitle);
        }

        // console.log(this.tourData?.destinationsTitle);

        this.writeReview.patchValue({ tour_id: response.data.id });
        this.bookingFormData.patchValue({ tour_id: response.data.id });
        this.getTourPricing(1);
        this.getReview(); // Fetch reviews for this specific tour

        // Update SEO
        this.updateTourSEO(response.data);
      },
      error: (err) => {
        this.toaster.error(err.error.message);
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

  // check pricing
  getTourPricing(adultNum: number) {
    if (!this.tourData) {
      this.toaster.error('No data available.');
      // console.log('No data available.');
      return;
    }

    if (
      this.tourData.pricing_groups &&
      this.tourData.pricing_groups.length > 0
    ) {
      // console.log("Pricing Groups Exist:", this.tourData.pricing_groups);

      // Find the correct pricing group based on adultNum
      const matchedGroup = this.tourData.pricing_groups.find(
        (group: { from: number; to: number }) =>
          adultNum >= group.from && adultNum <= group.to
      );

      if (matchedGroup) {
        // console.log("Matched Pricing Group:", matchedGroup);
        this.adultPrice = matchedGroup.price;
        this.childPrice = matchedGroup.child_price;
        this.totalPrice = this.adultPrice + this.childPrice;
        // console.log("Adult Price:", matchedGroup.price);
        // console.log("Child Price:", matchedGroup.child_price);
      } else {
        // console.log('No matching pricing group found.');
        this.adultPrice = this.tourData.adult_price;
        this.childPrice = this.tourData.child_price;
        this.infantPrice = this.tourData.infant_price;
        // this.totalPrice = this.adultPrice + this.childPrice + this.infantPrice;
      }
    } else {
      // If no pricing_groups exist, return default prices
      // console.log('No Pricing Groups - Using Default Prices');
      this.adultPrice = this.tourData.adult_price;
      this.childPrice = this.tourData.child_price;
      this.infantPrice = this.tourData.infant_price;
      // this.totalPrice = this.adultPrice + this.childPrice + this.infantPrice;
    }
  }

  // Helper method to format date as YYYY-MM-DD (local time, no timezone conversion)
  formatDateForSubmission(date: Date | null): string | null {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  submitBookingForm(): void {
    if (this.bookingFormData.valid) {
      // Format the date to avoid timezone issues
      const formValue = { ...this.bookingFormData.value };
      const selectedDate = formValue.start_date;

      if (selectedDate instanceof Date) {
        formValue.start_date = this.formatDateForSubmission(selectedDate);
      }

      // console.log(formValue);
      this._BookingService
        // ,localStorage.getItem('accessToken')
        .appendBookingData(formValue)
        .subscribe({
          next: (response) => {
            // console.log(response);
            if (response.status == true) {
              // console.log(response.status);
              // console.log(formValue);
              // console.log(localStorage.getItem('accessToken'));

              this.toaster.success(response.message);
              this._Router.navigate(['/cart']);
            }
          },
          error: (err) => {
            this.toaster.error(err.error.message);
          },
        });
    } else {
      this.toaster.error('Form is not valid , must choose start data');
    }
  }

  getWriteReview() {
    if (this.writeReview.valid) {
      // console.log(this.writeReview.value);
      this.isLoading = true;
      this._DataService
        .postReviews(this.writeReview.value, this.tourData!.id)
        .subscribe({
          next: (response) => {
            // console.log(response);
            if (response.status == true) {
              this.toaster.success(response.message);
              this.isLoading = false;
              this.writeReview.reset();
              this.getReview(); // Refresh reviews after successful submission
            }
          },
          error: (err) => {
            this.toaster.error(err.error.message || 'Error submitting review');
            this.isLoading = false;
          },
        });
    }
  }

  // check rate number <= 5 >=0
  validateRate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);

    if (value > 5) {
      value = 5;
    } else if (value < 0) {
      value = 0;
    }

    input.value = value.toString();
    this.writeReview.get('rate')?.setValue(value);
  }

  increment(type: string) {
    let currentValue = this.bookingFormData.get(type)?.value || 0;
    if (currentValue < 12) {
      this.bookingFormData.get(type)?.setValue(currentValue + 1);
    }
  }

  decrement(type: string) {
    let currentValue = this.bookingFormData.get(type)?.value || 0;
    if (currentValue > 0) {
      this.bookingFormData.get(type)?.setValue(currentValue - 1);
    }
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        // console.log(res.data);

        const contactPhone = res.data.find(
          (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
        );
        this.phoneNumber = contactPhone?.option_value[0];

        const contactEmail = res.data.find(
          (item: any) => item.option_key === 'email_address'
        );
        this.userEmail = contactEmail?.option_value[0];
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getFAQs(): void {
    this._DataService.getFAQs().subscribe({
      next: (response) => {
        this.faqsList = response.data.data;
        // console.log(response.data.data);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getReview(): void {
    if (this.tourData?.id) {
      this._DataService.getReviews(this.tourData.id).subscribe({
        next: (response) => {
          // console.log(response.data.data);
          this.tourReviews = response.data.data;
        },
        error: (err) => {
          console.error('Error fetching reviews:', err);
          this.tourReviews = [];
        },
      });
    }
  }

  getReviewQualityText(): string {
    const reviewCount =
      this.tourReviews.length || this.tourData?.reviews_number || 0;

    if (reviewCount === 0) {
      return 'New Tour';
    }

    // Calculate average rating from actual reviews if available
    const averageRating = this.getAverageRating();

    if (averageRating >= 4.5) {
      return 'Excellent Quality';
    } else if (averageRating >= 4.0) {
      return 'Very Good Quality';
    } else if (averageRating >= 3.5) {
      return 'Good Quality';
    } else if (averageRating >= 3.0) {
      return 'Average Quality';
    } else if (averageRating > 0) {
      return 'Below Average Quality';
    } else {
      return 'No Rating Available';
    }
  }

  getAverageRating(): number {
    if (this.tourReviews.length === 0) {
      return this.tourData?.rate || 0;
    }

    const totalRating = this.tourReviews.reduce(
      (sum, review) => sum + (review.rate || 0),
      0
    );
    return totalRating / this.tourReviews.length;
  }
}
