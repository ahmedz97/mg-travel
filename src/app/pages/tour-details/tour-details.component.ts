import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SlickCarouselModule } from 'ngx-slick-carousel';
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
    SlickCarouselModule,
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
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.scss',
})
export class TourDetailsComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private toaster: ToastrService,
    private _BookingService: BookingService,
    private sanitizer: DomSanitizer,
    private _SeoService: SeoService
  ) {}

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
        if (this.tourItenary.length > 0 && this.tourItenary[0].display_order !== undefined) {
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
        console.log(this.tourData);

        this.bannerTitle = this.tourData?.title || '?';
        console.log(this.bannerTitle);

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
    const baseUrl = 'https://egygo-travel.com';
    const tourImage = tour.image || tour.gallery?.[0]?.image || '';
    const tourDescription = tour.short_description || tour.description || `Book ${tour.title} tour with EGYGO Travel. Experience amazing destinations and create unforgettable memories.`;
    const destinations = tour.destinations?.map((d: any) => d.title).join(', ') || '';
    const keywords = `${tour.title}, tour, travel, ${destinations}, Egypt tours, booking`.toLowerCase();

    this._SeoService.updateSEO({
      title: `${tour.title} - Book Now | EGYGO Travel`,
      description: tourDescription.substring(0, 160),
      keywords: keywords,
      image: tourImage,
      url: `${baseUrl}/tour/${tour.slug}`,
      type: 'website',
    });

    // Add structured data
    const structuredData = this._SeoService.generateTourStructuredData(tour, baseUrl);
    this._SeoService.updateSEO({ structuredData });
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

  submitBookingForm(): void {
    if (this.bookingFormData.valid) {
      // console.log(this.bookingFormData.value);
      this._BookingService
        // ,localStorage.getItem('accessToken')
        .appendBookingData(this.bookingFormData.value)
        .subscribe({
          next: (response) => {
            // console.log(response);
            if (response.status == true) {
              // console.log(response.status);
              // console.log(this.bookingFormData.value);
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
      console.log(this.writeReview.value);
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

  galleryOptions = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    dots: false,
    arrows: true,
    speed: 500,
    prevArrow: '<button type="button" class="slick-prev custom-arrow"><i class="fa fa-arrow-left"></i></button>',
    nextArrow: '<button type="button" class="slick-next custom-arrow"><i class="fa fa-arrow-right"></i></button>',
  };
}
