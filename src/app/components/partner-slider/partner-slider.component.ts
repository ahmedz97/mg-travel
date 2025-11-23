import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-partner-slider',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './partner-slider.component.html',
  styleUrl: './partner-slider.component.scss',
})
export class PartnerSliderComponent implements AfterViewInit {
  @ViewChild('partnerCarousel') partnerCarousel!: ElementRef;
  partnerImg: any[] = [
    { src: '../../../assets/image/partner/civitatis.webp' },
    { src: '../../../assets/image/partner/partner.webp' },
    { src: '../../../assets/image/partner/partner1.webp' },
    { src: '../../../assets/image/partner/partner12.webp' },
    { src: '../../../assets/image/partner/partner2.webp' },
    { src: '../../../assets/image/partner/partner3.webp' },
    { src: '../../../assets/image/partner/partner4.webp' },
    { src: '../../../assets/image/partner/partner5.webp' },
    { src: '../../../assets/image/partner/partner6.webp' },
    { src: '../../../assets/image/partner/partner7.webp' },
    { src: '../../../assets/image/partner/partner8.webp' },
    { src: '../../../assets/image/partner/partner9.webp' },
    { src: '../../../assets/image/partner/partner99.webp' },
    { src: '../../../assets/image/partner/tourradar.webp' },
    { src: '../../../assets/image/partner/viator.webp' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSwiper();
      }, 100);
    }
  }

  initializeSwiper() {
    if (this.partnerCarousel?.nativeElement) {
      const el = this.partnerCarousel.nativeElement;
      el.slidesPerView = 6;
      el.spaceBetween = 20;
      el.loop = true;
      el.centeredSlides = true;
      el.autoplay = { delay: 1500, disableOnInteraction: false };
      el.speed = 500;
      el.breakpoints = {
        0: { slidesPerView: 2 },
        500: { slidesPerView: 2.5 },
        767: { slidesPerView: 3.5 },
        992: { slidesPerView: 4 },
        1200: { slidesPerView: 4.5 },
        1400: { slidesPerView: 6 },
      };
      el.initialize();
    }
  }
}
