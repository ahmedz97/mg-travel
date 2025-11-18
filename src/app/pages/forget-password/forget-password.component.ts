import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../components/banner/banner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, BannerComponent, TranslateModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _AuthService: AuthService,
    private toastr: ToastrService,
    private _Router: Router
  ) {}

  bannerTitle = 'forget password';
  logo!: any;
  siteTitle!: any;
  isLoading = false;
  countryList: any[] = [];

  forgetPasswordForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
    otp: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.getSettings();
    this.getCountries();
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        console.log(res.data);

        const contactLogo = res.data.find(
          (item: any) => item.option_key === 'logo'
        );
        const logoPath = contactLogo?.option_value[0];
        // Ensure logo URL is complete (add base URL if needed)
        this.logo = logoPath ? this._DataService.getImageUrl(logoPath) : null;

        const title = res.data.find(
          (item: any) => item.option_key === 'site_title'
        );
        this.siteTitle = title?.option_value[0];

        // console.log(this.logo);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getCountries() {
    this._DataService.getCountries().subscribe({
      next: (response) => {
        console.log(response.data);
        this.countryList = response.data;
      },
    });
  }

  handleForgetPassForm(): void {
    if (this.forgetPasswordForm.valid) {
      this.isLoading = true;
      this._AuthService.setOTP(this.forgetPasswordForm.value).subscribe({
        next: (response) => {
          if (response.status == true) {
            console.log(response);
            this.isLoading = false;
            this.toastr.success(response.message);
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err.error.message, 'Enter the correct otp code');
        },
      });
    }
  }
}
