import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  AfterViewInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import {
  NgxDropzoneComponent,
  NgxDropzoneLabelDirective,
  NgxDropzoneImagePreviewComponent,
} from 'ngx-dropzone-next';
import { BookingService } from '../../core/services/booking.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../core/services/data.service';
import { register } from 'swiper/element/bundle';
import { isPlatformBrowser } from '@angular/common';
register();
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgxDropzoneComponent,
    NgxDropzoneLabelDirective,
    NgxDropzoneImagePreviewComponent,
    CommonModule,
    ReactiveFormsModule,
    TourCartComponent,
    BannerComponent,
    MakeTripFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, AfterViewInit {
  @ViewChild('bookingCarousel') bookingCarousel!: ElementRef;
  @ViewChild('wishlistCarousel') wishlistCarousel!: ElementRef;
  constructor(
    private _DataService: DataService,
    private _BookingService: BookingService,
    private _ProfileService: ProfileService,
    private _Router: Router,
    private toaster: ToastrService,
    private _AuthService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  bannerTitle: string = 'my profile';
  updateProfile!: FormGroup;
  updateImage!: FormGroup;
  countriesList: any[] = [];
  tourCart: any[] = [];
  favList: any[] = [];
  haveData: boolean = false;
  profilemeData: any = {};

  files = signal<File[]>([]);

  selectedTab: string = 'dashboard';

  ngOnInit(): void {
    if (this._AuthService.getToken()) {
      console.log('done', this._AuthService.getToken());

      this.showCountries();
      this.profileMe();
      this.updateProfile = new FormGroup({
        name: new FormControl(''),
        password: new FormControl(''),
        password_confirmation: new FormControl(''),
        phone: new FormControl(''),
        // email: new FormControl(''),
        nationality: new FormControl(''),
      });
      this.updateImage = new FormGroup({
        image: new FormControl(''),
      });

      this.getListCart();
      this.getFav();
    } else {
      this._Router.navigate(['/login']);
      this.toaster.warning('Please Login First');
    }
  }

  // عند الاختيار
  onSelect(evt: any) {
    const added: File[] = evt?.addedFiles ?? [];
    if (!added.length) return;

    // const file = added[0]; // صورة واحدة فقط
    // اعرض بريفيه محلي للملف بينما بنرفع (لو حابب تفضل تعرض المخزنة سيب السطر ده)
    this.profilemeData.image = null; // عشان يبان الـ preview من dropzone
    this.files.set([added[0]]);
    this.uploadImage(added[0]);
    // this.files.set([file]);

    // this.uploadImage(file);
  }

  onRemove(file: File) {
    this.files.set([]);
  }

  uploadImage(file: File): void {
    const userImage = new FormData();
    userImage.append('image', file);

    this._ProfileService.updateImageProfile(userImage).subscribe({
      next: (res) => {
        // console.log('Uploaded ✅', res);
        // حاول تجيب الـ URL من الاستجابة
        const serverUrl = res?.data?.image || res?.image || res?.url || null;
        if (serverUrl) {
          // حدّث الصورة المخزنة واعمل كسر كاش
          this.profilemeData.image = this.cacheBust(serverUrl);
          // نظّف ملفات الـ preview
          this.files.set([]);
        }
        this.toaster.success('Profile image updated');
      },
      error: (err) => {
        console.error('Upload error ❌', err);
        this.toaster.error(err?.error?.message || 'Upload failed');
        // في حالة فشل الرفع رجّع البريفيو كما كان
        this.files.set([]);
        this.profileMe(); // رجّع صورة السيرفر (لو كانت موجودة)
      },
    });
  }

  // إضافة query param لكسر الكاش
  private cacheBust(url: string): string {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}_ts=${Date.now()}`;
  }

  getListCart(): void {
    this._BookingService.getCartList().subscribe({
      next: (response) => {
        this.tourCart = response.data;
        if (this.tourCart.length === 0) {
          this.haveData = false;
          // // console.log(this.tourCart);
        } else {
          this.tourCart = response.data.map((tour: any) => ({
            ...tour,
            totalPrice:
              tour.adults * tour.tour.adult_price +
              tour.children * tour.tour.child_price +
              tour.infants * tour.tour.infant_price,
          }));
          this.haveData = true;
          // console.log(this.tourCart);
        }
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  showCountries(): void {
    this._BookingService.getCountries().subscribe({
      next: (response) => {
        // console.log(response.data);
        this.countriesList = response.data;
      },
    });
  }

  submitProfileData(): void {
    if (this.updateProfile.valid) {
      const profileData = this.updateProfile.value;
      // console.log(profileData);
      this._ProfileService.updateProfile(profileData).subscribe({
        next: (response) => {
          // console.log(response);
          this.toaster.success(response.error.message);
        },
        error: (err) => {
          // console.log(err);
          this.toaster.error(err.error.message);
        },
      });
    } else {
      // console.log('nooooo');
    }
  }

  profileMe(): void {
    this._ProfileService.getProfile().subscribe({
      next: (response) => {
        this.profilemeData = response.data;
        const url = response?.data?.image;
        this.profilemeData.image = url ? this.cacheBust(url) : null;
        // مفيش ملفات مختارة حالياً
        this.files.set([]);
        // // console.log(this.profilemeData.image);
      },
      error: (err) => {
        // console.log(err);
        // // console.log(localStorage.getItem('accessToken'));
      },
    });
  }

  logout(): void {
    this._ProfileService.logoutProfile().subscribe({
      next: (response) => {
        // // console.log(response);
        localStorage.removeItem('accessToken');
        // navigate it to home
        this._Router.navigate(['']);
        // // console.log('ahmed');
        this.toaster.success(response.message);
      },
      error: (err) => {
        // // console.log(err);
        this.toaster.error(err.error.message);
      },
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSwipers();
      }, 100);
    }
  }

  initializeSwipers() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.bookingCarousel?.nativeElement) {
        const el = this.bookingCarousel.nativeElement;
        el.slidesPerView = 2;
        el.spaceBetween = 20;
        el.loop = true;
        el.autoplay = { delay: 1500, disableOnInteraction: false };
        el.pagination = { clickable: true };
        el.speed = 500;
        el.breakpoints = {
          0: { slidesPerView: 1 },
          586: { slidesPerView: 1 },
          992: { slidesPerView: 2 },
        };
        el.initialize();
      }
      if (this.wishlistCarousel?.nativeElement) {
        const el = this.wishlistCarousel.nativeElement;
        el.slidesPerView = 2;
        el.spaceBetween = 20;
        el.loop = true;
        el.autoplay = { delay: 1500, disableOnInteraction: false };
        el.pagination = { clickable: true };
        el.speed = 500;
        el.breakpoints = {
          0: { slidesPerView: 1 },
          586: { slidesPerView: 1 },
          992: { slidesPerView: 2 },
        };
        el.initialize();
      }
    }
  }

  getFav(): void {
    this._DataService.getWishlist().subscribe({
      next: (response) => {
        if (localStorage.getItem('accessToken')) {
          this.favList = response.data.data;
          // // console.log(response.data.data);
          if (this.favList.length === 0) {
            this.haveData = false;
            // // console.log(this.favList.length);
          } else {
            this.haveData = true;
            // console.log(response.data.data);
            this.favList = response.data.data;
          }
        }
      },
      error: (err) => {
        // this.toaster.error(err.error.message, 'you must login first');
      },
    });
  }

  // addFav(id: any): void {
  //   this._DataService.toggleWishlist(id).subscribe({
  //     next: (response) => {
  //       this.myFavList = response;
  //       // toggle fav icon style (add , remove)
  //       const index = this.favouriteIds.indexOf(id);
  //       if (index > -1) {
  //         this.favouriteIds.splice(index, 1);
  //       } else {
  //         this.favouriteIds.push(id);
  //       }
  //       // console.log(id);
  //       // console.log(this.myFavList);
  //       this.getFav();
  //       // this.toaster.success(response.message);
  //     },
  //     error: (err) => {
  //       // console.log(err);
  //       this.toaster.error(err.error.message);
  //     },
  //   });
  // }
}
