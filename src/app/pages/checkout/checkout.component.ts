import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { ToastrService } from 'ngx-toastr';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { BannerComponent } from '../../components/banner/banner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatRadioModule,
    ReactiveFormsModule,
    SlickCarouselModule,
    BannerComponent,
    TranslateModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  constructor(
    private _BookingService: BookingService,
    private toaster: ToastrService
  ) {}

  bannerTitle: string = 'checkout';

  checkoutData: object = {};
  countries: any[] = [];
  tourCart: any[] = [];
  haveData: boolean = false;

  ngOnInit(): void {
    this._BookingService.getCountries().subscribe({
      next: (response) => {
        // console.log(response.data);
        this.countries = response.data;
      },
    });
    this.getListCart();
  }

  checkoutForm: FormGroup = new FormGroup({
    first_name: new FormControl(''),
    last_name: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl(''),
    // start_date: new FormControl(''),
    country: new FormControl(''),
    state: new FormControl(''),
    // street_addres: new FormControl(''),
    payment_method: new FormControl(''),
    notes: new FormControl(''),
    currency_id: new FormControl(1),
    coupon_id: new FormControl(''),
  });

  getCheckoutData(): void {
    this.checkoutData = this.checkoutForm.value;
    // console.log(this.checkoutData);
    // console.log(this.checkoutForm.get('coupon_id')?.value);

    // if form is valid === true
    if (this.checkoutForm.valid) {
      this._BookingService
        .getCoupon(this.checkoutForm.get('coupon_id')?.value)
        .subscribe({
          next: (cResponse) => {
            console.log(cResponse);
            this.toaster.success(cResponse.message);
            // after coupon code is tammmam check other data and send it
            this._BookingService.sendCheckoutData(this.checkoutData).subscribe({
              next: (response) => {
                console.log(response);
                this.toaster.success(response.message);
              },
              error: (err) => {
                console.log(err);
                this.toaster.error(err.error.message);
              },
            });
          },
          error: (cError) => {
            console.log(cError);
            this.toaster.error(cError.error.message);
          },
        });
    }

    // this._BookingService.sendCheckoutData(this.checkoutData).subscribe({
    //   next: (response) => {
    //     // console.log(response);
    //     this.toaster.success(response.message);
    //     // if form is valid === true
    //     if (response.status) {
    //       this._BookingService
    //         .getCoupon(this.checkoutForm.get('coupon_id')?.value)
    //         .subscribe({
    //           next: (cResponse) => {
    //             // console.log(cResponse);
    //           },
    //           error: (cError) => {
    //             // console.log(cError);
    //           },
    //         });
    //     }
    //   },
    //   error: (err) => {
    //     console.log(err);
    //     this.toaster.error(err.error.message);
    //   },
    // });

    // this.checkoutForm.reset();
  }

  getListCart(): void {
    this._BookingService.getCartList().subscribe({
      next: (response) => {
        this.tourCart = response.data;
        if (this.tourCart.length === 0) {
          this.haveData = false;
          // console.log(this.tourCart);
        } else {
          this.haveData = true;
          // console.log(this.tourCart);

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

  getTotalPrice(): number {
    return this.tourCart.reduce((sum, cart) => sum + cart.totalPrice, 0);
  }

  ordersOptions = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    dots: true,
    arrows: false,
    speed: 500,
  };
}
