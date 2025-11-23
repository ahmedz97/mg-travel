import { Component, OnInit, ViewChild, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import {
  MaketripService,
  TripPayload,
} from '../../core/services/maketrip.service';
import { BookingService } from '../../core/services/booking.service';
import { ToastrService } from 'ngx-toastr';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import {
  MatFormFieldControl,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { BannerComponent } from '../../components/banner/banner.component';

@Component({
  selector: 'app-make-trip',
  standalone: true,
  imports: [
    MatStepperModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ReactiveFormsModule,
    BannerComponent,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  templateUrl: './make-trip.component.html',
  styleUrl: './make-trip.component.scss',
})
export class MakeTripComponent implements OnInit {
  constructor(
    private _MaketripService: MaketripService,
    private _BookingService: BookingService,
    private toaster: ToastrService,
    private _Router: Router
  ) {}

  @ViewChild('stepper') stepper!: MatStepper;

  bannerTitle: string = 'make Your trip';

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  submitFormGroup!: FormGroup;
  prefilled = false; // لو في داتا من Home

  monthList = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  makeTripForm: any = {};
  countriesList: any[] = [];
  destinationList: any[] = [];
  minBudget: number = 0;
  maxBudget: number = 0;

  ngOnInit() {
    this.showCountries();
    this.buildForms();

    this._MaketripService.getDestination().subscribe({
      next: (response) => {
        this.destinationList = response.data.data;
        console.log('destinationList', this.destinationList);
      },
      error: (err) => {
        // console.log(err.error.message);
      },
    });

    this._MaketripService.makeTripSteps$.subscribe((data) => {
      // this.tripData = data;
      // console.log('Received shared data:', data);

      // patch data
      if (!data) {
        this.prefilled = false;
        return;
      }
      this.applyIncoming(data);
      this.prefilled = true;

      // ignore first , second step after patchh values
      queueMicrotask(() => {
        if (this.stepper) this.stepper.selectedIndex = 2;
      });
    });

    this.onBudgetChange();
  }

  private buildForms() {
    this.firstFormGroup = new FormGroup({
      destination: new FormControl(''),
    });

    this.secondFormGroup = new FormGroup({
      type: new FormControl('exact_time'),
      start_date: new FormControl(null),
      end_date: new FormControl(null),
      month: new FormControl(null),
      days: new FormControl(''),
    });

    this.submitFormGroup = new FormGroup({
      first_name: new FormControl(''),
      last_name: new FormControl(''),
      email: new FormControl(''),
      nationality: new FormControl(''),
      phone_number: new FormControl(''),
      adults: new FormControl(0),
      children: new FormControl(0),
      infants: new FormControl(0),
      additional_notes: new FormControl(''),
      min_person_budget: new FormControl(5000),
      max_person_budget: new FormControl(20000),
      flight_offer: new FormControl(0),
    });
  }

  private toDate(v: any) {
    return v instanceof Date ? v : v ? new Date(v) : null;
  }

  private applyIncoming(data: TripPayload) {
    const destination = data.destination ?? '';
    const fromDate = this.toDate(data.fromDuration ?? null);
    const toDate = this.toDate(data.ToDuration ?? null);
    const approx = data.appro ?? null;

    this.firstFormGroup.patchValue({ destination });

    if (approx) {
      this.secondFormGroup.patchValue({
        type: 'approx_time',
        start_date: null,
        end_date: null,
        month: approx,
      });
    } else {
      this.secondFormGroup.patchValue({
        type: 'exact_time',
        start_date: fromDate,
        end_date: toDate,
        month: null,
      });
    }
    this.secondFormGroup.updateValueAndValidity({ emitEvent: false });
  }

  isDateTypeSelected(value: string): boolean {
    return this.secondFormGroup.get('type')?.value === value;
  }

  onToursChange(event: any) {
    this.firstFormGroup.patchValue({ destination: event.target.value });
  }

  submitForm() {
    if (this.submitFormGroup.status == 'VALID') {
      this.makeTripForm = {
        ...this.firstFormGroup.value,
        ...this.secondFormGroup.value,
        ...this.submitFormGroup.value,
      };

      this._MaketripService.sendDataTrip(this.makeTripForm).subscribe({
        next: (response) => {
          this.toaster.success(response.message);
          this._Router.navigate(['/']); //go to home page
        },
        error: (err) => {
          this.toaster.error(err.error.message);
        },
      });
    }
  }

  onBudgetChange() {
    this.minBudget = this.submitFormGroup.get('min_person_budget')?.value;
    this.maxBudget = this.submitFormGroup.get('max_person_budget')?.value;
  }

  increment(type: string) {
    let currentValue = this.submitFormGroup.get(type)?.value || 0;
    if (currentValue < 12) {
      this.submitFormGroup.get(type)?.setValue(currentValue + 1);
    }
  }

  decrement(type: string) {
    let currentValue = this.submitFormGroup.get(type)?.value || 0;
    if (currentValue > 0) {
      this.submitFormGroup.get(type)?.setValue(currentValue - 1);
    }
  }

  showCountries(): void {
    this._BookingService.getCountries().subscribe({
      next: (response) => {
        this.countriesList = response.data;
      },
    });
  }
}
