import { Component } from '@angular/core';
import { NgxCountAnimationDirective } from 'ngx-count-animation';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [NgxCountAnimationDirective],
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.scss',
})
export class CounterComponent {}
