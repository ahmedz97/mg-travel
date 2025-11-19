import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ViewChild,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-testimonial-cart',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './testimonial-cart.component.html',
  styleUrl: './testimonial-cart.component.scss',
})
export class TestimonialCartComponent implements AfterViewInit {
  @ViewChild('testimonialCarousel')
  testimonialCarousel!: ElementRef;

  constructor(
    private _DataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  allReviews: any[] = [];

  ngOnInit(): void {
    this.getTestimonials();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSwiper();
      }, 100);
    }
  }

  initializeSwiper() {
    if (this.testimonialCarousel?.nativeElement && this.allReviews.length > 0) {
      const el = this.testimonialCarousel.nativeElement;
      el.slidesPerView = 1;
      el.spaceBetween = 30;
      el.loop = true;
      el.autoplay = { delay: 1500, disableOnInteraction: false };
      el.speed = 500;
      el.effect = 'fade';
      el.fadeEffect = { crossFade: true };
      el.initialize();
    }
  }

  // Navigation methods
  prevTestimonial() {
    if (this.testimonialCarousel?.nativeElement) {
      this.testimonialCarousel.nativeElement.swiper.slidePrev();
    }
  }

  nextTestimonial() {
    if (this.testimonialCarousel?.nativeElement) {
      this.testimonialCarousel.nativeElement.swiper.slideNext();
    }
  }

  // testimonial
  getTestimonials() {
    this._DataService.getReviews().subscribe({
      next: (res) => {
        this.allReviews = res.data.data;
        console.log(this.allReviews);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.initializeSwiper();
          }, 100);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getStars(rate: number): boolean[] {
    const safeRate = Math.max(0, Math.min(5, Math.floor(rate || 0)));
    return Array.from({ length: 5 }, (_, i) => i < safeRate);
  }
}
