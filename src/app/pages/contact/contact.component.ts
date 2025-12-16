import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import { SafeUrlPipe } from '../../core/pipes/safe-url.pipe';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    SafeUrlPipe,
    PartnerSliderComponent,
    BannerComponent,
    MakeTripFormComponent,
    TranslateModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private toaster: ToastrService,
    private _SeoService: SeoService
  ) {}

  bannerTitle: string = 'contact';

  countryList: any[] = [];
  phoneNumber: any;
  userEmail: any;
  userAddress: any;
  userLocation: any;

  ngOnInit(): void {
    this._SeoService.updateSeoData(
      {},
      'Contact - MG Travel',
      "Get in touch with MG Travel. Contact us for bookings, inquiries, or travel assistance. We're here to help you plan your perfect trip.",
      '../../../assets/image/logo-MG-Travel.webp'
    );
    this.getCountries();
    // this.getSettings();
  }

  contactForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    country: new FormControl(''),
    subject: new FormControl(''),
    message: new FormControl(''),
  });

  getContactData(): void {
    // console.log(this.contactForm.value);

    this._DataService.contactData(this.contactForm.value).subscribe({
      next: (response) => {
        // console.log(response);
        this.toaster.success(response.message);
      },
      error: (err) => {
        // console.log(err.error);
        this.toaster.error(err.error.message);
      },
    });
    this.contactForm.reset();
  }

  getCountries() {
    this._DataService.getCountries().subscribe({
      next: (response) => {
        // console.log(response.data);
        this.countryList = response.data;
      },
    });
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        // console.log(res.data);

        const contactPhone = res.data.find(
          (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
        );
        this.phoneNumber = contactPhone?.option_value[0];

        const contactEmail = res.data.find(
          (item: any) => item.option_key === 'email_address'
        );
        this.userEmail = contactEmail?.option_value[0];

        const contactaddress = res.data.find(
          (item: any) => item.option_key === 'address'
        );
        this.userAddress = contactaddress?.option_value[0];

        const contactMap = res.data.find(
          (item: any) => item.option_key === 'company_location_url'
        );
        this.userLocation = contactMap?.option_value[0];
        // console.log(this.userLocation);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }
}
