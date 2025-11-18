import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-destination-cart',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './destination-cart.component.html',
  styleUrl: './destination-cart.component.scss',
})
export class DestinationCartComponent {
  @Input() destination: any;

  getStars(rate: number): number[] {
    const safeRate = Math.max(0, Math.min(5, Math.floor(rate || 0)));
    return Array(safeRate).fill(0);
  }
}
