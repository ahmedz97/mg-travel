import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DestinationCartComponent } from '../../components/destination-cart/destination-cart.component';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';

@Component({
  selector: 'app-destination',
  standalone: true,
  imports: [
    DestinationCartComponent,
    CommonModule,
    SlickCarouselModule,
    PartnerSliderComponent,
    BannerComponent,
    MakeTripFormComponent,
  ],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss',
})
export class DestinationComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _SeoService: SeoService
  ) {}
  allDestinations: any[] = [];

  bannerTitle: string = 'destination';

  ngOnInit(): void {
    this._SeoService.updateSEO({
      title: 'Destinations - Explore Amazing Places | EGYGO Travel',
      description: 'Discover amazing travel destinations with EGYGO Travel. Explore Egypt and other beautiful places around the world. Find tours and travel guides.',
      keywords: 'destinations, travel destinations, Egypt destinations, places to visit, travel locations, tourist destinations',
      url: 'https://egygo-travel.com/destination',
      type: 'website',
    });
    this.getDestination();
  }

  getDestination() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        this.allDestinations = res.data.data;

        console.log('all destinations', res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  destinationOptions = {
    infinite: true,
    slidesToShow: 4.5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    dots: true,
    arrows: true,
    speed: 500,
    prevArrow: '<button type="button" class="slick-prev custom-arrow"><i class="fa fa-arrow-left"></i></button>',
    nextArrow: '<button type="button" class="slick-next custom-arrow"><i class="fa fa-arrow-right"></i></button>',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3.5,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2.5,
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1.5,
        }
      }
    ]
  };
}
