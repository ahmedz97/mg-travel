import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../core/services/booking.service';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../components/banner/banner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, BannerComponent, TranslateModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  constructor(
    private _BookingService: BookingService,
    private toaster: ToastrService
  ) {}

  bannerTitle: string = 'cart';

  tourCart: any[] = [];
  haveData: boolean = false;

  totalPrice: number = 0;

  ngOnInit(): void {
    this.getListCart();
  }

  getListCart(): void {
    this._BookingService.getCartList().subscribe({
      next: (response) => {
        this.tourCart = response.data;
        if (this.tourCart.length === 0) {
          this.haveData = false;
          console.log(this.tourCart);
        } else {
          this.haveData = true;
          console.log(this.tourCart);

          this.tourCart.forEach((item) => {
            let adultPrice = 0;
            let childPrice = 0;
            let infantPrice = 0;

            if (item.tour?.pricing_groups?.length > 0) {
              const matchedGroup = item.tour.pricing_groups.find(
                (group: { from: number; to: number }) =>
                  item.adults >= group.from && item.adults <= group.to
              );

              if (matchedGroup) {
                adultPrice = matchedGroup.price;
                childPrice = matchedGroup.child_price;
              } else {
                adultPrice = item.tour.adult_price;
                childPrice = item.tour.child_price;
                infantPrice = item.tour.infant_price;
              }
            } else {
              adultPrice = item.tour.adult_price;
              childPrice = item.tour.child_price;
              infantPrice = item.tour.infant_price;
            }

            item.adultPrice = adultPrice;
            item.childPrice = childPrice;
            item.infantPrice = infantPrice;
            item.totalPrice =
              item.adults * item.adultPrice +
              item.children * item.childPrice +
              item.infants * item.infantPrice;
          });
        }
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  deleteCart(tourId: any): void {
    this._BookingService.deleteTourCart(tourId).subscribe({
      next: (response) => {
        // console.log(response.data);
        this.toaster.success(response.message);

        this.getListCart();

        // console.log(this.tourCart);
      },
      error: (err) => {
        // console.log(err);
        this.toaster.error(err.error.message);
      },
    });
  }

  clearCart(): void {
    this._BookingService.clearTourCart().subscribe({
      next: (response) => {
        // console.log(response.data);
        this.toaster.success(response.message);

        this.getListCart();

        // console.log(this.tourCart);
      },
      error: (err) => {
        // console.log(err);
        this.toaster.error(err.error.message);
      },
    });
  }
}
