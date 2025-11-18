import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tour-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './tour-cart.component.html',
  styleUrl: './tour-cart.component.scss',
})
export class TourCartComponent implements OnInit {
  @Input() layoutType: 'grid' | 'list' = 'grid';
  @Input() tour: any;

  favs: any[] = [];
  favouriteIds: number[] = [];
  alltours: any[] = [];
  tourReviews: any[] = [];

  constructor(
    private _DataService: DataService,
    private toaster: ToastrService,
    private _Router: Router,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const favs = localStorage.getItem('favouriteIds');
      this.favouriteIds = favs ? JSON.parse(favs) : [];
    } else {
      // console.warn('localStorage is not available (probably SSR mode)');
    }

    // Fetch reviews for this tour
    // if (this.tour?.id) {
    //   this.getTourReviews();
    // }
  }

  addFav(id: number, event: Event): void {
    event.stopPropagation();
    if (!localStorage.getItem('accessToken')) {
      this.toaster.error(this.translate.instant('common.youMustHaveAccount'));
      this._Router.navigate(['/login']);
      return;
    }
    this._DataService.toggleWishlist(id).subscribe({
      next: (response) => {
        if (localStorage.getItem('accessToken')) {
          this.favs = response;
          // toggle fav icon style (add , remove)
          const index = this.favouriteIds.indexOf(id);
          if (index > -1) {
            this.favouriteIds.splice(index, 1);
          } else {
            this.favouriteIds.push(id);
          }
          localStorage.setItem(
            'favouriteIds',
            JSON.stringify(this.favouriteIds)
          );
          // console.log(id);
          // console.log(this.favs);
          // this.toaster.success(response.message);
        } else {
          this.toaster.error(
            this.translate.instant('common.youMustHaveAccount')
          );
        }
      },
      error: (err) => {
        // console.log(err);
        this.toaster.error(err.error.message);
        // this._Router.navigate(['/login']);
      },
    });
  }

  getTourReviews(): void {
    if (this.tour?.id) {
      this._DataService.getReviews(this.tour.id).subscribe({
        next: (response) => {
          this.tourReviews = response.data.data || [];
          console.log('reviews fetched:', this.tourReviews);
        },
        error: (err) => {
          console.error('Error fetching reviews:', err);
          this.tourReviews = [];
        },
      });
    }
  }

  getStars(rate: number): boolean[] {
    const safeRate = Math.max(0, Math.min(5, Math.floor(rate || 0)));
    return Array.from({ length: 5 }, (_, i) => i < safeRate);
  }

  getAverageRating(): number {
    if (this.tourReviews.length === 0) {
      return this.tour?.rate || 0;
    }

    const totalRating = this.tourReviews.reduce(
      (sum, review) => sum + (review.rate || 0),
      0
    );
    return totalRating / this.tourReviews.length;
  }

  getReviewQualityText(): string {
    const reviewCount =
      this.tourReviews.length || this.tour?.reviews_number || 0;

    if (reviewCount === 0) {
      return this.translate.instant('common.newTour');
    }

    const averageRating = this.getAverageRating();

    if (averageRating >= 4.5) {
      return this.translate.instant('common.excellent');
    } else if (averageRating >= 4.0) {
      return this.translate.instant('common.veryGood');
    } else if (averageRating >= 3.5) {
      return this.translate.instant('common.good');
    } else if (averageRating >= 3.0) {
      return this.translate.instant('common.average');
    } else if (averageRating > 0) {
      return this.translate.instant('common.belowAverage');
    } else {
      return this.translate.instant('common.noRating');
    }
  }

  getReviewCount(): number {
    return this.tourReviews.length || this.tour?.reviews_number || 0;
  }

  getDestinationText(): string {
    if (this.tour?.destinationsTitle) {
      return this.tour.destinationsTitle;
    }

    if (
      this.tour?.destinations &&
      Array.isArray(this.tour.destinations) &&
      this.tour.destinations.length > 0
    ) {
      return this.tour.destinations.map((dest: any) => dest.title).join(', ');
    }

    return this.translate.instant('common.destinationNotSpecified');
  }
}
