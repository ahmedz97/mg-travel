import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-why-booking-with-us',
  standalone: true,
  imports: [TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './why-booking-with-us.component.html',
  styleUrl: './why-booking-with-us.component.scss',
})
export class WhyBookingWithUsComponent implements AfterViewInit {
  @ViewChild('bookingCarousel') bookingCarousel!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSwiper();
      }, 100);
    }
  }

  initializeSwiper() {
    if (this.bookingCarousel?.nativeElement) {
      const el = this.bookingCarousel.nativeElement;
      el.slidesPerView = 6;
      el.spaceBetween = 20;
      el.loop = true;
      el.autoplay = { delay: 2500, disableOnInteraction: false };
      el.speed = 500;
      el.breakpoints = {
        0: { slidesPerView: 1 },
        400: { slidesPerView: 1.5 },
        586: { slidesPerView: 1 },
        768: { slidesPerView: 2.5 },
        992: { slidesPerView: 3.5 },
        1200: { slidesPerView: 4.5 },
        1400: { slidesPerView: 6 },
      };
      el.initialize();
    }
  }
  bookingItems = [
    {
      icon: 'fa-comment-dollar',
      title: 'whyBooking.easyWaysToPay',
      titleIsTranslation: true,
      description: 'whyBooking.description',
      descriptionIsTranslation: true,
    },
    {
      icon: 'fa-hexagon-nodes',
      title: 'whyBooking.freedomToChange',
      titleIsTranslation: true,
      description: 'whyBooking.description',
      descriptionIsTranslation: true,
    },
    {
      icon: 'fa-ship',
      title: 'whyBooking.refundGuarantee',
      titleIsTranslation: true,
      description: 'whyBooking.description',
      descriptionIsTranslation: true,
    },
    {
      icon: 'fa-suitcase',
      title: 'whyBooking.bestPriceGuarantee',
      titleIsTranslation: true,
      description: 'whyBooking.description',
      descriptionIsTranslation: true,
    },
    {
      icon: 'fa-anchor',
      title: 'ATOL Protected',
      titleIsTranslation: false,
      description:
        'It is a long established fact that a reader will be distracted',
      descriptionIsTranslation: false,
    },
    {
      icon: 'fa-passport',
      title: 'Maldivian Islands Trip',
      titleIsTranslation: false,
      description:
        'It is a long established fact that a reader will be distracted',
      descriptionIsTranslation: false,
    },
  ];
}
