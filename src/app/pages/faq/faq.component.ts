import { Component, OnInit } from '@angular/core';
import { FaqContentComponent } from '../../components/faq-content/faq-content.component';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../components/banner/banner.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    FaqContentComponent,
    CommonModule,
    BannerComponent,
    MakeTripFormComponent,
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent implements OnInit {
  bannerTitle: string = 'FAQ';

  constructor(private _SeoService: SeoService) {}

  ngOnInit(): void {
    this._SeoService.updateSEO({
      title: 'Frequently Asked Questions (FAQ) - EGYGO Travel',
      description: 'Find answers to frequently asked questions about EGYGO Travel services, bookings, tours, and travel information. Get help with your travel inquiries.',
      keywords: 'FAQ, frequently asked questions, travel FAQ, booking questions, travel help, customer support',
      url: 'https://egygo-travel.com/faq',
      type: 'website',
    });
  }
}
