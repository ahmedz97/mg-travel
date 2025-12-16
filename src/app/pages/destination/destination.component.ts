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
import { RouterLink } from '@angular/router';
import { DestinationCartComponent } from '../../components/destination-cart/destination-cart.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-destination',
  standalone: true,
  imports: [
    DestinationCartComponent,
    CommonModule,
    PartnerSliderComponent,
    BannerComponent,
    MakeTripFormComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss',
})
export class DestinationComponent implements OnInit, AfterViewInit {
  @ViewChild('destinationCarousel') destinationCarousel!: ElementRef;

  constructor(
    private _DataService: DataService,
    private _SeoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  allDestinations: any[] = [];

  bannerTitle: string = 'destination';

  ngOnInit(): void {
    this._SeoService.updateSeoData(
      {},
      'Destination - MG Travel',
      'Explore our amazing destinations with MG Travel. Discover the best tours and experiences for your next adventure.',
      '../../../assets/image/logo-MG-Travel.webp'
    );
    this.getDestination();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSwiper();
      }, 100);
    }
  }

  initializeSwiper() {
    if (
      this.destinationCarousel?.nativeElement &&
      this.allDestinations.length > 0
    ) {
      const el = this.destinationCarousel.nativeElement;
      el.slidesPerView = 4.5;
      el.spaceBetween = 20;
      el.loop = true;
      el.autoplay = { delay: 1500, disableOnInteraction: false };
      el.pagination = { clickable: true };
      el.navigation = true;
      el.speed = 500;
      el.breakpoints = {
        0: { slidesPerView: 1 },
        586: { slidesPerView: 1 },
        767: { slidesPerView: 1.5 },
        992: { slidesPerView: 2.5 },
        1200: { slidesPerView: 3.5 },
        1400: { slidesPerView: 4.5 },
      };
      el.initialize();
    }
  }

  getDestination() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        this.allDestinations = res.data.data;
        // console.log('all destinations', res);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.initializeSwiper();
          }, 100);
        }
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }
}
