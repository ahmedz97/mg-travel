import { Component } from '@angular/core';
import { NgxSpinnerComponent } from 'ngx-spinner';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [NgxSpinnerComponent],
  templateUrl: './page-loader.component.html',
  styleUrl: './page-loader.component.scss',
})
export class PageLoaderComponent {}
