import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import {
  SlickCarouselModule,
  SlickCarouselComponent,
} from 'ngx-slick-carousel';

@Component({
  selector: 'app-testimonial-cart',
  standalone: true,
  imports: [CommonModule, SlickCarouselModule],
  templateUrl: './testimonial-cart.component.html',
  styleUrl: './testimonial-cart.component.scss',
})
export class TestimonialCartComponent {
  @ViewChild('testimonialCarousel')
  testimonialCarousel!: SlickCarouselComponent;

  constructor(private _DataService: DataService) {}

  allReviews: any[] = [];

  ngOnInit(): void {
    this.getTestimonials();
  }

  // Navigation methods
  prevTestimonial() {
    if (this.testimonialCarousel) {
      this.testimonialCarousel.slickPrev();
    }
  }

  nextTestimonial() {
    if (this.testimonialCarousel) {
      this.testimonialCarousel.slickNext();
    }
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

  testimonialOptions = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    dots: false,
    arrows: false,
    speed: 500,
    fade: true,
    cssEase: 'linear',
  };

  getStars(rate: number): boolean[] {
    const safeRate = Math.max(0, Math.min(5, Math.floor(rate || 0)));
    return Array.from({ length: 5 }, (_, i) => i < safeRate);
  }
}
