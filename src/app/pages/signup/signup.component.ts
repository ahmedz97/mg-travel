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
  selector: 'app-signup',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    BannerComponent,
    TranslateModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _AuthService: AuthService,
    private toastr: ToastrService,
    private _Router: Router
  ) {}

  bannerTitle = 'sign up';
  logo!: any;
  siteTitle!: any;
  isLoading = false;
  countryList: any[] = [];

  registerForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    password_confirmation: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    birthdate: new FormControl('', [Validators.required]),
    nationality: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.getSettings();
    this.getCountries();
  }
  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        // console.log(res.data);

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
        // console.log(response.data);
        this.countryList = response.data;
      },
    });
  }

  handleRegisterForm(): void {
    if (this.registerForm.valid) {
      // console.log(this.registerForm.value);
      this.isLoading = true;
      this._AuthService.setRegister(this.registerForm.value).subscribe({
        next: (response) => {
          // console.log(response);
          if (response.status == true) {
            // console.log('true');
            this.isLoading = false;
            this.toastr.success(response.message);

            // navigate to login
            this._Router.navigate(['/login']);
          }
        },
        error: (err) => {
          // console.log(err);
          this.isLoading = false;
          this.toastr.error(err.error.message);
        },
      });
    } else {
      this.toastr.error('Your Data is Not valid');
    }
  }
}
