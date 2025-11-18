import { Component, OnInit } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import {
  MatFormField,
  MatInputModule,
  MatLabel,
} from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaketripService } from '../../core/services/maketrip.service';
import { DataService } from '../../core/services/data.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-make-trip-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    TranslateModule,
  ],
  templateUrl: './make-trip-form.component.html',
  styleUrl: './make-trip-form.component.scss',
})
export class MakeTripFormComponent implements OnInit {
  private $destory = new Subject<void>();

  constructor(
    private _Router: Router,
    private _DataService: DataService,
    private _MaketripService: MaketripService
  ) {}

  allDestinations: any[] = [];
  MarkTime: string = 'exact';
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

  ngOnInit(): void {
    this.getDestination();
  }

  makeTripForm = new FormGroup({
    city: new FormControl('', Validators.required),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    approximate_time: new FormControl(''),
  });

  // onTourSubmit() {
  //   const formData = {
  //     ...this.tourSearchForm.value,
  //   };

  //   // navigate to tour List
  //   this._Router.navigate(['/tour'], {
  //     queryParams: formData,
  //   });
  // }

  onMakeTripSubmit() {
    if (this.makeTripForm.invalid) return;

    console.log('fire done onMakeTripSubmit');
    console.log(this.makeTripForm.value);

    const formValue = this.makeTripForm.value;

    this._MaketripService.setMakeTripSteps({
      destination: formValue.city || undefined,
      fromDuration: formValue.start_date || null,
      ToDuration: formValue.end_date || null,
      appro: formValue.approximate_time || null,
    });

    this._Router.navigate(['/makeTrip']);
  }

  onChangeTime(TypeTime: string): void {
    this.MarkTime = TypeTime;
  }

  getDestination() {
    this._DataService
      .getDestination()
      .pipe(
        takeUntil(this.$destory), // close , clear suscripe memory on destroy
        tap((res) => {
          if (res) {
            // console.log('home page -- ', res);
            this.allDestinations = res.data.data;
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.$destory.next();
    this.$destory.complete();
  }
}
