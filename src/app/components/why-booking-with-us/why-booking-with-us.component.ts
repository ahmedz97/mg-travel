import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-why-booking-with-us',
  standalone: true,
  imports: [TranslateModule, SlickCarouselModule],
  templateUrl: './why-booking-with-us.component.html',
  styleUrl: './why-booking-with-us.component.scss',
})
export class WhyBookingWithUsComponent {
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

  bookingOptions = {
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    dots: false,
    arrows: false,
    speed: 500,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4.5,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3.5,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.5,
        },
      },

      {
        breakpoint: 400,
        settings: {
          slidesToShow: 1.5,
        },
      },
    ],
  };
}
