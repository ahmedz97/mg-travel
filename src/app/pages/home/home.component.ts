import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  AfterViewInit,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  afterNextRender,
  ElementRef,
} from '@angular/core';
import { register } from 'swiper/element/bundle';
register();
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DestinationCartComponent } from '../../components/destination-cart/destination-cart.component';
import { TeamCartComponent } from '../../components/team-cart/team-cart.component';
import { BlogCartComponent } from '../../components/blog-cart/blog-cart.component';
import { BooknowComponent } from '../../components/booknow/booknow.component';
import { TestimonialCartComponent } from '../../components/testimonial-cart/testimonial-cart.component';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { AboutsectionComponent } from '../../components/aboutsection/aboutsection.component';
import { Subject, takeUntil, tap } from 'rxjs';
import { WhyBookingWithUsComponent } from '../../components/why-booking-with-us/why-booking-with-us.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import {
  MatFormField,
  MatInputModule,
  MatLabel,
} from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MaketripService } from '../../core/services/maketrip.service';
import { CounterComponent } from '../../components/counter/counter.component';
import { TranslateModule } from '@ngx-translate/core';
import { AboutCategoryComponent } from '../../components/about-category/about-category.component';

interface DestinationPriceMap {
  [title: string]: number;
}

declare var $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    // RouterLink,
    TourCartComponent,
    // DestinationCartComponent,
    // TeamCartComponent,
    BlogCartComponent,
    // BooknowComponent,
    TestimonialCartComponent,
    PartnerSliderComponent,
    AboutsectionComponent,
    WhyBookingWithUsComponent,
    MatTabsModule,
    MatFormField,
    MatLabel,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    // CounterComponent,
    TranslateModule,
    DestinationCartComponent,
    AboutCategoryComponent,
    CounterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('tourCarousel') tourCarousel!: ElementRef;
  @ViewChild('popularToursCarousel') popularToursCarousel!: ElementRef;
  @ViewChild('destinationCarousel') destinationCarousel!: ElementRef;

  private $destory = new Subject<void>();
  toursLoaded = false; // Flag to track when tours are loaded
  isBrowser = false;
  // Navigation methods for first carousel
  prevTourCarousel() {
    if (this.tourCarousel?.nativeElement) {
      this.tourCarousel.nativeElement.swiper.slidePrev();
    }
  }

  nextTourCarousel() {
    if (this.tourCarousel?.nativeElement) {
      this.tourCarousel.nativeElement.swiper.slideNext();
    }
  }

  // Navigation methods for second carousel (popularToursCarousel)
  prevPopularToursCarousel() {
    if (this.popularToursCarousel?.nativeElement) {
      this.popularToursCarousel.nativeElement.swiper.slidePrev();
    }
  }

  nextPopularToursCarousel() {
    if (this.popularToursCarousel?.nativeElement) {
      this.popularToursCarousel.nativeElement.swiper.slideNext();
    }
  }

  constructor(
    private _DataService: DataService,
    private _Router: Router,
    private _MaketripService: MaketripService,
    private sanitizer: DomSanitizer,
    private _SeoService: SeoService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef
  ) {
    this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.rawVideoUrl
    );
    // this.isBrowser = isPlatformBrowser(platformId);
    afterNextRender(() => {
      this.isBrowser = true;

      // We may need to manually trigger change detection
      this.cdr.detectChanges();
      console.log(this.el.nativeElement);
      console.log(this.tourstest);
    });
  }

  ngAfterViewInit(): void {
    // Force change detection after view init to prevent flickering
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
    }
    // Initialize Swiper after view init
    setTimeout(() => {
      this.initializeSwipers();
    }, 100);
  }

  initializeSwipers() {
    if (this.isBrowser) {
      if (this.destinationCarousel?.nativeElement) {
        const el = this.destinationCarousel.nativeElement;
        el.slidesPerView = 3.5;
        el.spaceBetween = 20;
        el.loop = true;
        el.autoplay = { delay: 2500, disableOnInteraction: false };
        el.pagination = { clickable: true };
        el.breakpoints = {
          0: { slidesPerView: 1 },
          586: { slidesPerView: 1.5 },
          767: { slidesPerView: 2.5 },
          992: { slidesPerView: 3 },
          1200: { slidesPerView: 3.5 },
        };
        el.initialize();
      }
      if (this.tourCarousel?.nativeElement && this.toursLoaded) {
        const el = this.tourCarousel.nativeElement;
        el.slidesPerView = 4;
        el.spaceBetween = 20;
        el.loop = true;
        el.autoplay = {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        };
        el.speed = 500;
        el.breakpoints = {
          0: { slidesPerView: 1 },
          586: { slidesPerView: 1 },
          767: { slidesPerView: 2 },
          992: { slidesPerView: 2.5 },
          1200: { slidesPerView: 3.5 },
          1400: { slidesPerView: 4 },
        };
        el.initialize();
      }
      if (this.popularToursCarousel?.nativeElement && this.toursLoaded) {
        const el = this.popularToursCarousel.nativeElement;
        el.slidesPerView = 4;
        el.spaceBetween = 20;
        el.loop = true;
        el.autoplay = {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        };
        el.speed = 500;
        el.breakpoints = {
          0: { slidesPerView: 1 },
          586: { slidesPerView: 1 },
          767: { slidesPerView: 2 },
          992: { slidesPerView: 2.5 },
          1200: { slidesPerView: 3.5 },
          1400: { slidesPerView: 4 },
        };
        el.initialize();
      }
    }
  }

  tourSearchForm!: FormGroup;
  allDestinations: any[] = [];
  allCategories: any[] = [];
  allDurations: any[] = [];
  alltours: any[] = [];
  alltoursInDestination: any[] = [];
  categoriesWithTours: any[] = []; // Store categories with included tours
  allToursFromCategories: any[] = []; // Bound to UI: current (possibly filtered) list
  tourstest: any[] = [];
  allToursMaster: any[] = []; // Immutable master list to filter from
  destinationPrices: DestinationPriceMap = {};
  categoryPrices: DestinationPriceMap = {};
  activeCategoryTitle: string | null = null;
  activeDestinationTitle: string | null = null;
  allBlogs: any[] = [];
  allReviews: any[] = [];

  mainSecSlider: any[] = [
    { src: '../../../assets/image/new/9.webp' },
    { src: '../../../assets/image/new/13.webp' },
    { src: '../../../assets/image/new/7.webp' },
    { src: '../../../assets/image/new/4.webp' },
    // { src: '../../../assets/image/new/14.png' },
    // { src: '../../../assets/image/new/10.png' },
    // { src: '../../../assets/image/new/4.png' },
    // { src: '../../../assets/image/new/5.png' },
  ];

  rawVideoUrl =
    'https://www.youtube.com/embed/mfxQy5A_tHs?autoplay=1&mute=1&loop=1&playlist=mfxQy5A_tHs&controls=0&showinfo=0&rel=0&iv_load_policy=3';
  // video
  // rawVideoUrl = 'https://www.youtube.com/embed/k3KqP69xuPc?si=jlt_SSYpm0STHo7I';
  posterSrc = '../../../assets/image/blog2.webp';
  sanitizedVideoUrl: SafeResourceUrl | null = null;
  isVideoPlaying = false;

  MarkTime: string = 'exact';
  monthList = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  ngOnInit(): void {
    this.setupSEO();
    this.getDestination();
    this.getCategory();
    this.getDurations();
    // Initial filtering will run after categories load to ensure data is present
    // this.getDestinationTours();
    this.getTestimonials();
    this.tourSearchForm = new FormGroup({
      location: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      duration: new FormControl(''),
    });

    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
    }
  }

  setupSEO(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        const siteTitle =
          res.data.find((item: any) => item.option_key === 'site_title')
            ?.option_value[0] || 'EGYGO Travel';
        const siteDescription =
          res.data.find((item: any) => item.option_key === 'site_description')
            ?.option_value[0] ||
          "Discover amazing tours and destinations with EGYGO Travel. Book your perfect trip to Egypt and explore the world's most beautiful places.";
        const logoPath =
          res.data.find((item: any) => item.option_key === 'logo')
            ?.option_value[0] || '';
        const logo = logoPath ? this._DataService.getImageUrl(logoPath) : '';

        this._SeoService.updateSEO({
          title: `${siteTitle} - Your Trusted Travel Partner`,
          description: siteDescription,
          keywords:
            'travel, tours, Egypt, destinations, vacation, booking, travel agency, Nile cruises, pyramids, Luxor, Aswan',
          image: logo,
          url: 'https://egygo-travel.com',
          type: 'website',
        });

        // Add organization structured data
        const orgData = this._SeoService.generateOrganizationStructuredData(
          {
            site_title: siteTitle,
            site_description: siteDescription,
            logo: logo,
            phone:
              res.data.find(
                (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
              )?.option_value[0] || '',
            email:
              res.data.find((item: any) => item.option_key === 'email_address')
                ?.option_value[0] || '',
            address:
              res.data.find((item: any) => item.option_key === 'address')
                ?.option_value[0] || '',
          },
          'https://egygo-travel.com'
        );
        this._SeoService.updateSEO({ structuredData: orgData });
      },
    });
  }

  makeTripForm = new FormGroup({
    city: new FormControl('', Validators.required),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    approximate_time: new FormControl(''),
  });

  onTourSubmit() {
    const formData = {
      ...this.tourSearchForm.value,
    };

    // navigate to tour List
    this._Router.navigate(['/tour'], {
      queryParams: formData,
    });
  }

  onMakeTripSubmit() {
    if (this.makeTripForm.invalid) return;

    // console.log('fire done onMakeTripSubmit');
    // console.log(this.makeTripForm.value);

    const formValue = this.makeTripForm.value;

    this._MaketripService.setMakeTripSteps({
      destination: formValue.city || undefined,
      fromDuration: formValue.start_date || null,
      ToDuration: formValue.end_date || null,
      appro: formValue.approximate_time || null,
    });

    this._Router.navigate(['/makeTrip']);
  }

  onChangeTime(TypeTime: string): void {
    this.MarkTime = TypeTime;
  }

  getTours(categoryTitle?: string) {
    this.activeCategoryTitle = categoryTitle ?? null;

    // Always filter from master list
    let filtered = [...this.allToursMaster];

    if (categoryTitle) {
      const normalize = (s?: string) => (s ?? '').trim().toLowerCase();
      const normalizedCategoryTitle = normalize(categoryTitle);

      filtered = filtered.filter((tour: any) => {
        // Check if tour has category_ids array (added during extraction)
        if (tour.category_ids && Array.isArray(tour.category_ids)) {
          return tour.category_ids.some((catId: number) => {
            const category = this.allCategories.find((cat) => cat.id === catId);
            return (
              category && normalize(category.title) === normalizedCategoryTitle
            );
          });
        }
        // Check if tour has categories array (from regular API calls)
        if (tour.categories && Array.isArray(tour.categories)) {
          return tour.categories.some(
            (c: any) => normalize(c.title) === normalizedCategoryTitle
          );
        }
        // Check if tour has pivot with category_id (from included tours data)
        if (tour.pivot && tour.pivot.category_id) {
          const category = this.allCategories.find(
            (cat) => cat.id === tour.pivot.category_id
          );
          return (
            category && normalize(category.title) === normalizedCategoryTitle
          );
        }
        // Check if tour has single category_id (legacy support)
        if (tour.category_id) {
          const category = this.allCategories.find(
            (cat) => cat.id === tour.category_id
          );
          return (
            category && normalize(category.title) === normalizedCategoryTitle
          );
        }
        return false;
      });
    }

    // Write filtered list back to the UI-bound array used by the template
    this.allToursFromCategories = filtered;
    this.alltours = filtered;

    // get lowest price for destinations and categories
    this.destinationPrices = {};
    this.categoryPrices = {};

    for (const tour of filtered) {
      const price = Number(tour.start_from) || 0;

      (tour.destinations || []).forEach((dest: any) => {
        if (
          this.destinationPrices[dest.title] == null ||
          price < this.destinationPrices[dest.title]
        ) {
          this.destinationPrices[dest.title] = price;
        }
      });

      (tour.categories || []).forEach((cat: any) => {
        if (
          this.categoryPrices[cat.title] == null ||
          price < this.categoryPrices[cat.title]
        ) {
          this.categoryPrices[cat.title] = price;
        }
      });
    }

    // console.log('Filtered tours by category:', this.allToursFromCategories);
    // console.log(
    //   'Total tours before filtering:',
    //   this.allToursFromCategories.length
    // );
    // console.log('Total tours after filtering:', filtered.length);
  }

  getDestinationTours(destinationTitle?: string): void {
    this.activeDestinationTitle = destinationTitle ?? null;

    // Always filter from master list
    let filtered = [...this.allToursMaster];

    if (destinationTitle) {
      const normalize = (s?: string) => (s ?? '').trim().toLowerCase();
      const normalizedDestinationTitle = normalize(destinationTitle);

      filtered = filtered.filter((tour: any) => {
        return (
          tour.destinations &&
          tour.destinations.some(
            (dest: any) => normalize(dest.title) === normalizedDestinationTitle
          )
        );
      });
    }

    this.alltoursInDestination = filtered;
    // console.log('Filtered tours by destination:', this.alltoursInDestination);
    // console.log('Selected destination:', destinationTitle);
    // console.log(
    //   'Total tours before filtering:',
    //   this.allToursFromCategories.length
    // );
    // console.log('Total tours after filtering:', filtered.length);
  }

  ngOnDestroy(): void {
    this.$destory.next();
    this.$destory.complete();
  }

  getDestination() {
    this._DataService
      .getDestination()
      .pipe(
        takeUntil(this.$destory), // close , clear suscripe memory on destroy
        tap((res) => {
          if (res) {
            // console.log('home page -- ', res);
            this.allDestinations = res.data.data;
          }
        })
      )
      .subscribe();
  }

  getCategory() {
    this._DataService.getCategories().subscribe({
      next: (res) => {
        console.log(res.data.data);

        this.allCategories = res.data.data;
        this.categoriesWithTours = res.data.data;

        // Extract all tours from categories and store them
        this.allToursFromCategories = [];
        const tourCategoryMap = new Map(); // Track which categories each tour belongs to

        this.categoriesWithTours.forEach((category) => {
          if (category.tours && Array.isArray(category.tours)) {
            category.tours.forEach((tour: any) => {
              // Check if tour already exists
              const existingTour = this.allToursFromCategories.find(
                (existingTour) => existingTour.id === tour.id
              );

              if (!existingTour) {
                // Add category information to tour for easier filtering
                tour.category_ids = [category.id];
                tour.category_titles = [category.title];
                this.allToursFromCategories.push(tour);
                tourCategoryMap.set(tour.id, [category.id]);
              } else {
                // Tour already exists, add this category to its list
                if (!existingTour.category_ids.includes(category.id)) {
                  existingTour.category_ids.push(category.id);
                  existingTour.category_titles.push(category.title);
                  tourCategoryMap.get(tour.id).push(category.id);
                }
              }
            });
          }
        });

        const pricesMap = this.categoryPrices; // مثل { Multi Days Tours: 80, Egypt Classic Tours: 100, Nile Cruises: 150 , Adventure Tours: 80,Culture Tours: 80 }
        console.log(pricesMap);

        this.allCategories = this.allCategories.map((cat: any) => {
          const categoryTitle = cat.title.trim().toLowerCase();
          let matched = false;

          for (const key in pricesMap) {
            const priceTitle = key.trim().toLowerCase();
            // console.log(priceTitle, categoryTitle);

            if (categoryTitle === priceTitle) {
              cat.start_price = pricesMap[key];
              matched = true;
              break;
            }
          }

          if (!matched) {
            cat.start_price = pricesMap['Nile Cruises']; // fallback to Nile Cruises price
            console.log('not matched');
          }

          return cat;
        });

        console.log('all categories with start price', this.allCategories);
        console.log('All tours from categories:', this.allToursFromCategories);
        console.log('Categories with tours:', this.categoriesWithTours);
        console.log('Tour category mapping:', tourCategoryMap);

        // Prepare master list and initialize default views
        if (this.allToursFromCategories.length > 0) {
          this.allToursMaster = [...this.allToursFromCategories];
          // Show all by default
          this.getTours();
          this.getDestinationTours();
          // Mark tours as loaded and trigger change detection
          this.toursLoaded = true;
          if (this.isBrowser) {
            setTimeout(() => {
              this.initializeSwipers();
            }, 100);
          }
        } else {
          // If no tours found in categories, get all tours as fallback
          console.log('No tours found in categories, fetching all tours...');
          this.getAllToursFallback();
        }
      },
    });
  }

  getAllToursFallback() {
    // Fallback method to get all tours if categories don't include them
    this._DataService.getTours().subscribe({
      next: (res) => {
        this.tourstest = res.data.data;
        this.allToursFromCategories = res.data.data.reverse() || [];
        console.log('allToursFromCategories', this.allToursFromCategories);
        console.log('tourstest', this.tourstest);
        // this.allToursFromCategories = res.data.data;
        // this.alltours = [...this.allToursFromCategories];
        // Initialize default lists for both category and destination views
        // this.getTours();
        // this.getDestinationTours();
        // Mark tours as loaded and trigger change detection
        this.toursLoaded = true;
        if (this.isBrowser) {
          setTimeout(() => {
            this.initializeSwipers();
          }, 100);
        }
        console.log('Fallback: All tours loaded:', this.allToursFromCategories);
      },
      error: (err) => console.log(err),
    });
  }

  getDurations() {
    this._DataService
      .getToursDuration()
      .pipe(
        takeUntil(this.$destory), // close , clear suscripe memory on destroy
        tap((res) => {
          this.allDurations = res.data;
          console.log(this.allDurations);
        })
      )
      .subscribe({
        next: (res) => {
          // console.log(res.data);
        },
        error: (err) => {
          // console.log(err);
        },
      });
  }

  // testimonial
  getTestimonials() {
    this._DataService.getReviews().subscribe({
      next: (res) => {
        this.allReviews = res.data.data;
        console.log(this.allReviews);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onBlogsLoaded(blogs: any[]) {
    this.allBlogs = blogs;
  }

  // video controls
  openVideo() {
    this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.rawVideoUrl
    );
    this.isVideoPlaying = true;
  }
  closeVideo() {
    this.sanitizedVideoUrl = null;
    this.isVideoPlaying = false;
  }

  // rate star
  getStars(rate: number): boolean[] {
    const safeRate = Math.max(0, Math.min(5, Math.floor(rate || 0)));
    return Array.from({ length: 5 }, (_, i) => i < safeRate);
  }

  // tourstest: any[] = [
  //   {
  //     id: 8,
  //     slug: 'hurghada',
  //     tours_count: 2,
  //     parent_id: 1,
  //     display_order: 0,
  //     global: false,
  //     enabled: true,
  //     featured: true,
  //     banner:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Destinations/snorkling hurghada (1).jpeg',
  //     featured_image:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/hurghada.webp',
  //     gallery: [
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Hurghada/Giftun2.jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Hurghada/Giftun1.webp',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Hurghada/snorkling hurghada (2).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Hurghada/snorkling hurghada (8).jpg',
  //     ],
  //     title: 'Hurghada',
  //     description:
  //       "<p>Hurghada is one of Egypt&rsquo;s most beloved Red Sea destinations, famous for its crystal-clear waters, colorful coral reefs, and vibrant marine life. Stretching along a beautiful coastline, the city offers a perfect blend of relaxation and adventure, with golden beaches, luxury resorts, and a wide range of water activities including snorkeling, diving, and windsurfing. Beyond the sea, Hurghada also provides opportunities for desert safaris, Bedouin experiences, and lively nightlife. Whether you're seeking serene moments by the water or exciting excursions, Hurghada is an ideal getaway for travelers looking to enjoy Egypt&rsquo;s natural beauty and warm hospitality.</p>",
  //   },
  //   {
  //     id: 6,
  //     slug: 'aswan',
  //     tours_count: 2,
  //     parent_id: 1,
  //     display_order: 0,
  //     global: false,
  //     enabled: true,
  //     featured: true,
  //     banner:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Destinations/edfu (29).jpg',
  //     featured_image:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/aswan.jpg',
  //     gallery: [
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Aswan/معبد فيلة (7).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Aswan/معبد فيلة (16).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Aswan/معبد فيلة (6).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Aswan/السد العالي (1).png',
  //     ],
  //     title: 'Aswan',
  //     description:
  //       '<article class="text-token-text-primary w-full focus:outline-none [--shadow-height:45px] has-data-writing-block:pointer-events-none has-data-writing-block:-mt-(--shadow-height) has-data-writing-block:pt-(--shadow-height) [&amp;:has([data-writing-block])&gt;*]:pointer-events-auto [content-visibility:auto] supports-[content-visibility:auto]:[contain-intrinsic-size:auto_100lvh] scroll-mt-[calc(var(--header-height)+min(200px,max(70px,20svh)))]" dir="auto" tabindex="-1" data-turn-id="request-WEB:324b96c2-7040-431c-a280-af845399405e-8" data-testid="conversation-turn-18" data-scroll-anchor="true" data-turn="assistant">\r\n<div class="text-base my-auto mx-auto pb-10 [--thread-content-margin:--spacing(4)] thread-sm:[--thread-content-margin:--spacing(6)] thread-lg:[--thread-content-margin:--spacing(16)] px-(--thread-content-margin)">\r\n<div class="[--thread-content-max-width:40rem] thread-lg:[--thread-content-max-width:48rem] mx-auto max-w-(--thread-content-max-width) flex-1 group/turn-messages focus-visible:outline-hidden relative flex w-full min-w-0 flex-col agent-turn" tabindex="-1">\r\n<div class="flex max-w-full flex-col grow">\r\n<div class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&amp;]:mt-1" dir="auto" data-message-author-role="assistant" data-message-id="ee1f05c8-54d3-444b-9761-b2af9d4532b6" data-message-model-slug="gpt-5-1">\r\n<div class="flex w-full flex-col gap-1 empty:hidden first:pt-[1px]">\r\n<div class="markdown prose dark:prose-invert w-full break-words light markdown-new-styling">\r\n<p data-start="83" data-end="744" data-is-last-node="" data-is-only-node="">Aswan is a serene and picturesque city in southern Egypt, known for its peaceful Nile scenery, warm climate, and rich Nubian heritage. Once a strategic gateway to Africa, Aswan is home to some of Egypt&rsquo;s most captivating sites, including the beautiful Philae Temple, the impressive High Dam, and the colorful Nubian villages that line the river. Its granite quarries supplied stone for ancient monuments throughout Egypt, while its tranquil Nile views make it a favorite retreat for travelers. With a perfect blend of history, culture, and natural beauty, Aswan offers a relaxing yet culturally enriching experience along the banks of the world&rsquo;s longest river.</p>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</article>',
  //   },
  //   {
  //     id: 5,
  //     slug: 'luxor',
  //     tours_count: 4,
  //     parent_id: 1,
  //     display_order: 0,
  //     global: false,
  //     enabled: true,
  //     featured: true,
  //     banner:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Destinations/Ballon (29).jpg',
  //     featured_image:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/luxor.webp',
  //     gallery: [
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Luxor/معبد الاقصر (1).png',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Luxor/معبد الاقصر (15).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Luxor/معبد الكرنك (3).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Luxor/معبد الاقصر (22).jpg',
  //     ],
  //     title: 'Luxor',
  //     description:
  //       '<article class="text-token-text-primary w-full focus:outline-none [--shadow-height:45px] has-data-writing-block:pointer-events-none has-data-writing-block:-mt-(--shadow-height) has-data-writing-block:pt-(--shadow-height) [&amp;:has([data-writing-block])&gt;*]:pointer-events-auto [content-visibility:auto] supports-[content-visibility:auto]:[contain-intrinsic-size:auto_100lvh] scroll-mt-[calc(var(--header-height)+min(200px,max(70px,20svh)))]" dir="auto" tabindex="-1" data-turn-id="request-WEB:324b96c2-7040-431c-a280-af845399405e-10" data-testid="conversation-turn-22" data-scroll-anchor="true" data-turn="assistant">\r\n<div class="text-base my-auto mx-auto pb-10 [--thread-content-margin:--spacing(4)] thread-sm:[--thread-content-margin:--spacing(6)] thread-lg:[--thread-content-margin:--spacing(16)] px-(--thread-content-margin)">\r\n<div class="[--thread-content-max-width:40rem] thread-lg:[--thread-content-max-width:48rem] mx-auto max-w-(--thread-content-max-width) flex-1 group/turn-messages focus-visible:outline-hidden relative flex w-full min-w-0 flex-col agent-turn" tabindex="-1">\r\n<div class="flex max-w-full flex-col grow">\r\n<div class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&amp;]:mt-1" dir="auto" data-message-author-role="assistant" data-message-id="a7994bdd-2cf5-4881-ac87-2bdd469b5d73" data-message-model-slug="gpt-5-1">\r\n<div class="flex w-full flex-col gap-1 empty:hidden first:pt-[1px]">\r\n<div class="markdown prose dark:prose-invert w-full break-words light markdown-new-styling">\r\n<p data-start="84" data-end="704" data-is-last-node="" data-is-only-node="">Luxor is often described as the world&rsquo;s greatest open-air museum, home to an extraordinary collection of ancient Egyptian monuments that reflect thousands of years of history. Divided by the Nile into the East and West Banks, Luxor showcases iconic temples such as Karnak and Luxor Temple on the East Bank, while the West Bank holds the legendary Valley of the Kings, Queen Hatshepsut&rsquo;s Mortuary Temple, and the Colossi of Memnon. With its rich archaeological treasures, vibrant local culture, and breathtaking Nile landscapes, Luxor offers an unforgettable journey into the heart of ancient Egypt&rsquo;s grandeur and legacy.</p>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</article>',
  //   },
  //   {
  //     id: 2,
  //     slug: 'cairo',
  //     tours_count: 4,
  //     parent_id: 1,
  //     display_order: 0,
  //     global: false,
  //     enabled: true,
  //     featured: true,
  //     banner:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/images.jpeg',
  //     featured_image:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/new.jpg',
  //     gallery: [
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/haram (121).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/gem4.webp',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/haram (19).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/GEM3.jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/haram (192).jpg',
  //     ],
  //     title: 'Cairo',
  //     description:
  //       '<article class="text-token-text-primary w-full focus:outline-none [--shadow-height:45px] has-data-writing-block:pointer-events-none has-data-writing-block:-mt-(--shadow-height) has-data-writing-block:pt-(--shadow-height) [&amp;:has([data-writing-block])&gt;*]:pointer-events-auto [content-visibility:auto] supports-[content-visibility:auto]:[contain-intrinsic-size:auto_100lvh] scroll-mt-[calc(var(--header-height)+min(200px,max(70px,20svh)))]" dir="auto" tabindex="-1" data-turn-id="request-WEB:324b96c2-7040-431c-a280-af845399405e-11" data-testid="conversation-turn-24" data-scroll-anchor="true" data-turn="assistant">\r\n<div class="text-base my-auto mx-auto pb-10 [--thread-content-margin:--spacing(4)] thread-sm:[--thread-content-margin:--spacing(6)] thread-lg:[--thread-content-margin:--spacing(16)] px-(--thread-content-margin)">\r\n<div class="[--thread-content-max-width:40rem] thread-lg:[--thread-content-max-width:48rem] mx-auto max-w-(--thread-content-max-width) flex-1 group/turn-messages focus-visible:outline-hidden relative flex w-full min-w-0 flex-col agent-turn" tabindex="-1">\r\n<div class="flex max-w-full flex-col grow">\r\n<div class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&amp;]:mt-1" dir="auto" data-message-author-role="assistant" data-message-id="1b2d8802-59c0-4235-8b88-f2649cdd60b2" data-message-model-slug="gpt-5-1">\r\n<div class="flex w-full flex-col gap-1 empty:hidden first:pt-[1px]">\r\n<div class="markdown prose dark:prose-invert w-full break-words light markdown-new-styling">\r\n<p data-start="113" data-end="736" data-is-last-node="" data-is-only-node="">Cairo, Egypt&rsquo;s bustling capital, is a vibrant blend of ancient wonders and modern energy, offering an unforgettable journey through history and culture. Just outside the city lies the legendary Giza Plateau, home to the iconic Pyramids of Giza and the Great Sphinx&mdash;timeless symbols of ancient Egyptian civilization. Within Cairo itself, grand museums, lively markets, historic mosques, and Nile-side views create a rich and immersive experience. From the awe-inspiring pyramids to the cultural treasures displayed in world-class museums, Cairo stands as a gateway to Egypt&rsquo;s past and a thriving center of contemporary life.</p>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</article>',
  //   },

  //   {
  //     id: 8,
  //     slug: 'hurghada',
  //     tours_count: 2,
  //     parent_id: 1,
  //     display_order: 0,
  //     global: false,
  //     enabled: true,
  //     featured: true,
  //     banner:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Destinations/snorkling hurghada (1).jpeg',
  //     featured_image:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/hurghada.webp',
  //     gallery: [
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Hurghada/Giftun2.jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Hurghada/Giftun1.webp',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Hurghada/snorkling hurghada (2).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Hurghada/snorkling hurghada (8).jpg',
  //     ],
  //     title: 'Hurghada',
  //     description:
  //       "<p>Hurghada is one of Egypt&rsquo;s most beloved Red Sea destinations, famous for its crystal-clear waters, colorful coral reefs, and vibrant marine life. Stretching along a beautiful coastline, the city offers a perfect blend of relaxation and adventure, with golden beaches, luxury resorts, and a wide range of water activities including snorkeling, diving, and windsurfing. Beyond the sea, Hurghada also provides opportunities for desert safaris, Bedouin experiences, and lively nightlife. Whether you're seeking serene moments by the water or exciting excursions, Hurghada is an ideal getaway for travelers looking to enjoy Egypt&rsquo;s natural beauty and warm hospitality.</p>",
  //   },
  //   {
  //     id: 6,
  //     slug: 'aswan',
  //     tours_count: 2,
  //     parent_id: 1,
  //     display_order: 0,
  //     global: false,
  //     enabled: true,
  //     featured: true,
  //     banner:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Destinations/edfu (29).jpg',
  //     featured_image:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/aswan.jpg',
  //     gallery: [
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Aswan/معبد فيلة (7).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Aswan/معبد فيلة (16).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Aswan/معبد فيلة (6).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Aswan/السد العالي (1).png',
  //     ],
  //     title: 'Aswan',
  //     description:
  //       '<article class="text-token-text-primary w-full focus:outline-none [--shadow-height:45px] has-data-writing-block:pointer-events-none has-data-writing-block:-mt-(--shadow-height) has-data-writing-block:pt-(--shadow-height) [&amp;:has([data-writing-block])&gt;*]:pointer-events-auto [content-visibility:auto] supports-[content-visibility:auto]:[contain-intrinsic-size:auto_100lvh] scroll-mt-[calc(var(--header-height)+min(200px,max(70px,20svh)))]" dir="auto" tabindex="-1" data-turn-id="request-WEB:324b96c2-7040-431c-a280-af845399405e-8" data-testid="conversation-turn-18" data-scroll-anchor="true" data-turn="assistant">\r\n<div class="text-base my-auto mx-auto pb-10 [--thread-content-margin:--spacing(4)] thread-sm:[--thread-content-margin:--spacing(6)] thread-lg:[--thread-content-margin:--spacing(16)] px-(--thread-content-margin)">\r\n<div class="[--thread-content-max-width:40rem] thread-lg:[--thread-content-max-width:48rem] mx-auto max-w-(--thread-content-max-width) flex-1 group/turn-messages focus-visible:outline-hidden relative flex w-full min-w-0 flex-col agent-turn" tabindex="-1">\r\n<div class="flex max-w-full flex-col grow">\r\n<div class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&amp;]:mt-1" dir="auto" data-message-author-role="assistant" data-message-id="ee1f05c8-54d3-444b-9761-b2af9d4532b6" data-message-model-slug="gpt-5-1">\r\n<div class="flex w-full flex-col gap-1 empty:hidden first:pt-[1px]">\r\n<div class="markdown prose dark:prose-invert w-full break-words light markdown-new-styling">\r\n<p data-start="83" data-end="744" data-is-last-node="" data-is-only-node="">Aswan is a serene and picturesque city in southern Egypt, known for its peaceful Nile scenery, warm climate, and rich Nubian heritage. Once a strategic gateway to Africa, Aswan is home to some of Egypt&rsquo;s most captivating sites, including the beautiful Philae Temple, the impressive High Dam, and the colorful Nubian villages that line the river. Its granite quarries supplied stone for ancient monuments throughout Egypt, while its tranquil Nile views make it a favorite retreat for travelers. With a perfect blend of history, culture, and natural beauty, Aswan offers a relaxing yet culturally enriching experience along the banks of the world&rsquo;s longest river.</p>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</article>',
  //   },
  //   {
  //     id: 5,
  //     slug: 'luxor',
  //     tours_count: 4,
  //     parent_id: 1,
  //     display_order: 0,
  //     global: false,
  //     enabled: true,
  //     featured: true,
  //     banner:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Destinations/Ballon (29).jpg',
  //     featured_image:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/luxor.webp',
  //     gallery: [
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Luxor/معبد الاقصر (1).png',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Luxor/معبد الاقصر (15).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Luxor/معبد الكرنك (3).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Luxor/معبد الاقصر (22).jpg',
  //     ],
  //     title: 'Luxor',
  //     description:
  //       '<article class="text-token-text-primary w-full focus:outline-none [--shadow-height:45px] has-data-writing-block:pointer-events-none has-data-writing-block:-mt-(--shadow-height) has-data-writing-block:pt-(--shadow-height) [&amp;:has([data-writing-block])&gt;*]:pointer-events-auto [content-visibility:auto] supports-[content-visibility:auto]:[contain-intrinsic-size:auto_100lvh] scroll-mt-[calc(var(--header-height)+min(200px,max(70px,20svh)))]" dir="auto" tabindex="-1" data-turn-id="request-WEB:324b96c2-7040-431c-a280-af845399405e-10" data-testid="conversation-turn-22" data-scroll-anchor="true" data-turn="assistant">\r\n<div class="text-base my-auto mx-auto pb-10 [--thread-content-margin:--spacing(4)] thread-sm:[--thread-content-margin:--spacing(6)] thread-lg:[--thread-content-margin:--spacing(16)] px-(--thread-content-margin)">\r\n<div class="[--thread-content-max-width:40rem] thread-lg:[--thread-content-max-width:48rem] mx-auto max-w-(--thread-content-max-width) flex-1 group/turn-messages focus-visible:outline-hidden relative flex w-full min-w-0 flex-col agent-turn" tabindex="-1">\r\n<div class="flex max-w-full flex-col grow">\r\n<div class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&amp;]:mt-1" dir="auto" data-message-author-role="assistant" data-message-id="a7994bdd-2cf5-4881-ac87-2bdd469b5d73" data-message-model-slug="gpt-5-1">\r\n<div class="flex w-full flex-col gap-1 empty:hidden first:pt-[1px]">\r\n<div class="markdown prose dark:prose-invert w-full break-words light markdown-new-styling">\r\n<p data-start="84" data-end="704" data-is-last-node="" data-is-only-node="">Luxor is often described as the world&rsquo;s greatest open-air museum, home to an extraordinary collection of ancient Egyptian monuments that reflect thousands of years of history. Divided by the Nile into the East and West Banks, Luxor showcases iconic temples such as Karnak and Luxor Temple on the East Bank, while the West Bank holds the legendary Valley of the Kings, Queen Hatshepsut&rsquo;s Mortuary Temple, and the Colossi of Memnon. With its rich archaeological treasures, vibrant local culture, and breathtaking Nile landscapes, Luxor offers an unforgettable journey into the heart of ancient Egypt&rsquo;s grandeur and legacy.</p>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</article>',
  //   },
  //   {
  //     id: 2,
  //     slug: 'cairo',
  //     tours_count: 4,
  //     parent_id: 1,
  //     display_order: 0,
  //     global: false,
  //     enabled: true,
  //     featured: true,
  //     banner:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/images.jpeg',
  //     featured_image:
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/new.jpg',
  //     gallery: [
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/haram (121).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/gem4.webp',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/haram (19).jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/GEM3.jpg',
  //       'https://tourism-api.perfectsolutions4u.com/storage/media/Cairo/haram (192).jpg',
  //     ],
  //     title: 'Cairo',
  //     description:
  //       '<article class="text-token-text-primary w-full focus:outline-none [--shadow-height:45px] has-data-writing-block:pointer-events-none has-data-writing-block:-mt-(--shadow-height) has-data-writing-block:pt-(--shadow-height) [&amp;:has([data-writing-block])&gt;*]:pointer-events-auto [content-visibility:auto] supports-[content-visibility:auto]:[contain-intrinsic-size:auto_100lvh] scroll-mt-[calc(var(--header-height)+min(200px,max(70px,20svh)))]" dir="auto" tabindex="-1" data-turn-id="request-WEB:324b96c2-7040-431c-a280-af845399405e-11" data-testid="conversation-turn-24" data-scroll-anchor="true" data-turn="assistant">\r\n<div class="text-base my-auto mx-auto pb-10 [--thread-content-margin:--spacing(4)] thread-sm:[--thread-content-margin:--spacing(6)] thread-lg:[--thread-content-margin:--spacing(16)] px-(--thread-content-margin)">\r\n<div class="[--thread-content-max-width:40rem] thread-lg:[--thread-content-max-width:48rem] mx-auto max-w-(--thread-content-max-width) flex-1 group/turn-messages focus-visible:outline-hidden relative flex w-full min-w-0 flex-col agent-turn" tabindex="-1">\r\n<div class="flex max-w-full flex-col grow">\r\n<div class="min-h-8 text-message relative flex w-full flex-col items-end gap-2 text-start break-words whitespace-normal [.text-message+&amp;]:mt-1" dir="auto" data-message-author-role="assistant" data-message-id="1b2d8802-59c0-4235-8b88-f2649cdd60b2" data-message-model-slug="gpt-5-1">\r\n<div class="flex w-full flex-col gap-1 empty:hidden first:pt-[1px]">\r\n<div class="markdown prose dark:prose-invert w-full break-words light markdown-new-styling">\r\n<p data-start="113" data-end="736" data-is-last-node="" data-is-only-node="">Cairo, Egypt&rsquo;s bustling capital, is a vibrant blend of ancient wonders and modern energy, offering an unforgettable journey through history and culture. Just outside the city lies the legendary Giza Plateau, home to the iconic Pyramids of Giza and the Great Sphinx&mdash;timeless symbols of ancient Egyptian civilization. Within Cairo itself, grand museums, lively markets, historic mosques, and Nile-side views create a rich and immersive experience. From the awe-inspiring pyramids to the cultural treasures displayed in world-class museums, Cairo stands as a gateway to Egypt&rsquo;s past and a thriving center of contemporary life.</p>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</article>',
  //   },
  // ];

  // Swiper carousel options
  destinationOptions = {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1.5,
      },
      586: {
        slidesPerView: 1.5,
      },
      767: {
        slidesPerView: 2.5,
      },
      992: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 3.5,
      },
    },
  };
  // testimonialOptions: OwlOptions = {
  //   loop: true,
  //   mouseDrag: true,
  //   touchDrag: true,
  //   pullDrag: true,
  //   autoplay: true,
  //   dots: false,
  //   smartSpeed: 1500,
  //   margin: 30,
  //   responsive: {
  //     0: { items: 1 },
  //     992: { items: 2 },
  //   },
  //   nav: true,
  //   navText: [
  //     '<i class="fa fa-angle-double-left"></i>',
  //     '<i class="fa fa-angle-double-right"></i>',
  //   ],
  // };
  popularToursOptions = {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    speed: 500,
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      586: {
        slidesPerView: 1,
      },
      767: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 2.5,
      },
      1200: {
        slidesPerView: 3.5,
      },
      1400: {
        slidesPerView: 4,
      },
    },
  };
  tourOptions = {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    speed: 500,
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      586: {
        slidesPerView: 1,
      },
      767: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 2.5,
      },
      1200: {
        slidesPerView: 3.5,
      },
      1400: {
        slidesPerView: 4,
      },
    },
  };
}
