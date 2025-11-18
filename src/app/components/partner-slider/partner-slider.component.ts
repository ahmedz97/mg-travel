import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-partner-slider',
  standalone: true,
  imports: [SlickCarouselModule, CommonModule],
  templateUrl: './partner-slider.component.html',
  styleUrl: './partner-slider.component.scss',
})
export class PartnerSliderComponent {
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

  partnersOptions = {
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    centerMode: true,
    centerPadding: '20px',
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
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };
}
