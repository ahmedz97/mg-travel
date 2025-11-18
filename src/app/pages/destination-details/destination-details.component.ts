import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import { CommonModule } from '@angular/common';
import { SocialComponent } from '../../components/social/social.component';
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { FaqContentComponent } from '../../components/faq-content/faq-content.component';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-destination-details',
  standalone: true,
  imports: [
    RouterLink,
    SlickCarouselModule,
    CommonModule,
    SocialComponent,
    TourCartComponent,
    FaqContentComponent,
    PartnerSliderComponent,
    BannerComponent,
    MakeTripFormComponent,
  ],
  templateUrl: './destination-details.component.html',
  styleUrl: './destination-details.component.scss',
})
export class DestinationDetailsComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private _SeoService: SeoService
  ) {}

  getSanitizedHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  destinationDetails: any = {};
  destinationSlug: any = '';
  AllDestination: any[] = [];
  tours: any[] = [];
  filteredTours: any[] = [];

  layoutType: 'grid' | 'list' = 'grid';
  bannerTitle: string = '';

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: (param) => {
        this.destinationSlug = param.get('slug');
        // console.log('Destination Slug:', this.destinationSlug);

        this._DataService.getDestinationBySlug(this.destinationSlug).subscribe({
          next: (response) => {
            this.destinationDetails = response.data;
            // console.log(this.destinationSlug);
            this.showTours(this.destinationSlug);
            this.bannerTitle = this.destinationDetails.title;
            console.log(
              'destination Details title:',
              this.destinationDetails.title
            );
            console.log('destination Details:', this.destinationDetails);
            
            // Update SEO
            this.updateDestinationSEO(response.data);
          },
          error: (err) => {
            console.error('Error fetching destination details:', err);
          },
        });
      },
    });
    this.getDestinations();
    // this.showTours();
  }

  getDestinations() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        // console.log(res.data.data);
        this.AllDestination = res.data.data;
      },
    });
  }

  // to display tours which related this destination
  showTours(desSlug: string): void {
    this._DataService.getTours().subscribe({
      next: (response) => {
        this.tours = response.data.data;
        console.log('Tours Data:', this.tours, this.tours.length);
        for (let i = 0; i < this.tours.length; i++) {
          const tour = this.tours[i];
          const tourDestinationSlugs = (tour.destinations ?? []).map((x: any) =>
            x?.slug != null ? String(x.slug).toLowerCase().trim() : ''
          );

          // check if any destination matches the slug
          if (tourDestinationSlugs.includes(desSlug.toLowerCase())) {
            this.filteredTours.push(tour);
          }
          console.log(tourDestinationSlugs, this.filteredTours, desSlug);
        }
      },
      error: (err) => {
        console.error('Error fetching tours:', err);
      },
    });
  }

  updateDestinationSEO(destination: any): void {
    const baseUrl = 'https://egygo-travel.com';
    const destImage = destination.image || '';
    const destDescription = destination.description || destination.short_description || `Explore ${destination.title} with EGYGO Travel. Discover amazing tours and experiences.`;
    const keywords = `${destination.title}, destination, travel, tours, ${destination.title} tours, Egypt travel`.toLowerCase();

    this._SeoService.updateSEO({
      title: `${destination.title} - Tours & Travel Guide | EGYGO Travel`,
      description: destDescription.substring(0, 160),
      keywords: keywords,
      image: destImage,
      url: `${baseUrl}/destination/${destination.slug}`,
      type: 'website',
    });

    // Add structured data
    const structuredData = this._SeoService.generateDestinationStructuredData(destination, baseUrl);
    this._SeoService.updateSEO({ structuredData });
  }

  galleryOptions = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    dots: true,
    arrows: false,
    speed: 500,
    responsive: [
      {
        breakpoint: 940,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 740,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };
}
