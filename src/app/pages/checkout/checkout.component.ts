import {
  Component,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { ToastrService } from 'ngx-toastr';
import { register } from 'swiper/element/bundle';
register();
import { BannerComponent } from '../../components/banner/banner.component';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

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
    BannerComponent,
    TranslateModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  @ViewChild('ordersCarousel') ordersCarousel!: ElementRef;

  constructor(
    private _BookingService: BookingService,
    private toaster: ToastrService,
    private _Router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  bannerTitle: string = 'checkout';

  checkoutData: object = {};
  countries: any[] = [];
  tourCart: any[] = [];
  haveData: boolean = false;
  couponApplied: boolean = false;
  couponDiscount: number = 0;
  couponData: any = null;

  ngOnInit(): void {
    this._BookingService.getCountries().subscribe({
      next: (response) => {
        // console.log(response.data);
        this.countries = response.data;
      },
    });
    this.getListCart();
  }

  // must start with 0 and must be 10 digits
  phonePattern = '^01[0-2][0-9]{8}$';
  checkoutForm: FormGroup = new FormGroup({
    first_name: new FormControl(''),
    last_name: new FormControl(''),
    phone: new FormControl('', Validators.pattern(this.phonePattern)),
    email: new FormControl('', [Validators.email]),
    // start_date: new FormControl(''),
    country: new FormControl(''),
    // state: new FormControl(''),
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
      this._BookingService.sendCheckoutData(this.checkoutData).subscribe({
        next: (response) => {
          // console.log(response);
          this.toaster.success(response.message);
          this.checkoutForm.reset();
          this.couponApplied = false;
          this.couponDiscount = 0;
          this.couponData = null;
          this.getListCart();
          this._Router.navigate(['/']);
        },
        error: (err) => {
          // console.log(err);
          this.toaster.error(err.error.message);
        },
      });
    }
  }

  getListCart(): void {
    this._BookingService.getCartList().subscribe({
      next: (response) => {
        this.tourCart = response.data;
        // console.log(this.tourCart);
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

  applyCoupon(): void {
    const couponCode = this.checkoutForm.get('coupon_id')?.value;

    if (!couponCode || couponCode.trim() === '') {
      this.toaster.error('Please enter a coupon code');
      return;
    }

    this._BookingService.getCoupon(couponCode).subscribe({
      next: (cResponse) => {
        // console.log(cResponse);
        this.couponApplied = true;
        this.couponData = cResponse.data;

        // Calculate discount based on coupon type (percentage or fixed amount)
        const totalPrice = this.getTotalPrice();
        console.log('totalPrice', totalPrice);
        if (this.couponData.type === 'percentage') {
          this.couponDiscount = (totalPrice * this.couponData.value) / 100;
          console.log('couponDiscount percentage', this.couponDiscount);
        } else {
          this.couponDiscount = this.couponData.value;
          console.log('couponDiscount fixed amount', this.couponDiscount);
        }

        this.toaster.success(
          cResponse.message || 'Coupon applied successfully!'
        );
      },
      error: (cError) => {
        // console.log(cError);
        this.couponApplied = false;
        this.couponDiscount = 0;
        this.couponData = null;
        this.toaster.error(cError.error.message || 'Invalid coupon code');
      },
    });
    this.checkoutForm.get('coupon_id')?.reset();
  }

  getTotalPriceAfterCouponCode(): number {
    const totalPrice = this.getTotalPrice();

    if (this.couponApplied && this.couponDiscount > 0) {
      const finalPrice = totalPrice - this.couponDiscount;
      return finalPrice > 0 ? finalPrice : 0;
    }

    return totalPrice;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSwiper();
      }, 100);
    }
  }

  initializeSwiper() {
    if (this.ordersCarousel?.nativeElement) {
      const el = this.ordersCarousel.nativeElement;
      el.slidesPerView = 1;
      el.spaceBetween = 20;
      el.loop = true;
      el.autoplay = { delay: 1500, disableOnInteraction: false };
      el.pagination = { clickable: true };
      el.speed = 500;
      el.initialize();
    }
  }
}
