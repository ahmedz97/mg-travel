import { Component, OnInit } from '@angular/core';
import { AboutsectionComponent } from '../../components/aboutsection/aboutsection.component';
import { TeamCartComponent } from '../../components/team-cart/team-cart.component';
import { TestimonialCartComponent } from '../../components/testimonial-cart/testimonial-cart.component';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../components/banner/banner.component';
import { WhyBookingWithUsComponent } from '../../components/why-booking-with-us/why-booking-with-us.component';
import { AboutCategoryComponent } from '../../components/about-category/about-category.component';
import { CounterComponent } from '../../components/counter/counter.component';
import { BooknowComponent } from '../../components/booknow/booknow.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    BannerComponent,
    AboutsectionComponent,
    TeamCartComponent,
    TestimonialCartComponent,
    PartnerSliderComponent,
    CommonModule,
    WhyBookingWithUsComponent,
    AboutCategoryComponent,
    CounterComponent,
    MakeTripFormComponent,
    TranslateModule,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  bannerTitle = 'about us';

  constructor(private _SeoService: SeoService) {}

  ngOnInit(): void {
    this._SeoService.updateSEO({
      title: 'About Us - EGYGO Travel',
      description: 'Learn about EGYGO Travel, your trusted travel partner. Discover our mission, values, and commitment to providing exceptional travel experiences.',
      keywords: 'about us, travel agency, EGYGO Travel, company information, travel services',
      url: 'https://egygo-travel.com/about',
      type: 'website',
    });
  }
}
