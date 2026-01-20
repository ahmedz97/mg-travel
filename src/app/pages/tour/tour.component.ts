import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { TourcartComponent } from '../../components/tourcart/tourcart.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
import { DataService } from '../../core/services/data.service';
import { SeoService } from '../../core/services/seo.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { MakeTripFormComponent } from '../../components/make-trip-form/make-trip-form.component';
import { TranslateModule } from '@ngx-translate/core';

type FilterKey = 'selectedTripType' | 'selectedDestination';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatSliderModule,
    NgxPaginationModule,
    TourCartComponent,
    PaginationComponent,
    BannerComponent,
    MakeTripFormComponent,
    TranslateModule,
  ],
  templateUrl: './tour.component.html',
  styleUrl: './tour.component.scss',
})
export class TourComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _SeoService: SeoService
  ) {}

  bannerTitle: string = 'tour search';

  // pagination
  itemsPerPage: number = 15;
  currentPage: number = 1;
  totalItems: number = 0;
  allToursCount: number = 0;

  layoutType: 'grid' | 'list' = 'grid';
  minBudget = 0;
  maxBudget = 5000;

  // IDs (for internal logic)
  selectedDestination: number | null = null;
  selectedTripType: number | null = null;
  selectedDuration: number | null = null;

  // Slugs (for URL and API)
  selectedDestinationSlug: string | null = null;
  selectedCategorySlug: string | null = null;
  selectedDurationSlug: string | null = null;

  allCategories: any[] = [];
  allDestinations: any[] = [];
  allDurations: any[] = [];
  allTours: any[] = [];
  filteredTours: any[] = [];

  // Collapse states for filter sections (Accordion)
  isCategoryExpanded: boolean = false;
  isPriceExpanded: boolean = true; // Only price is open by default
  isDurationExpanded: boolean = false;
  isDestinationExpanded: boolean = false;

  ngOnInit(): void {
    // 1. Update SEO
    this._SeoService.updateSeoData(
      {},
      'Tour Search - MG Travel',
      'Find the perfect tour for your next adventure with MG Travel. Browse our wide selection of tours and destinations.',
      '../../../assets/image/logo-MG-Travel.webp'
    );

    // 2. Fetch base data
    this.getAllTours();
    this.getDestination();
    this.getCategories();
    this.getDurations();

    // 3. Subscribe to queryParams to read filters from URL
    this._ActivatedRoute.queryParams.subscribe((param) => {
      // Handle destination (slug)
      if (param['destination']) {
        this.selectedDestinationSlug = param['destination'];
        const destination = this.allDestinations.find(
          (dest) => dest.slug === param['destination']
        );
        if (destination) {
          this.selectedDestination = destination.id;
        } else {
          this.selectedDestination = null;
        }
      } else {
        this.selectedDestinationSlug = null;
        this.selectedDestination = null;
      }

      // Handle category (slug)
      if (param['type']) {
        this.selectedCategorySlug = param['type'];
        const category = this.allCategories.find(
          (cat) => cat.slug === param['type']
        );
        if (category) {
          this.selectedTripType = category.id;
        } else {
          this.selectedTripType = null;
        }
      } else {
        this.selectedCategorySlug = null;
        this.selectedTripType = null;
      }

      // Handle duration (slug or ID for backward compatibility)
      if (param['duration']) {
        const durationParam = param['duration'];
        const isNumeric = !isNaN(Number(durationParam));

        if (isNumeric) {
          // Backward compatibility: ID format
          this.selectedDuration = Number(durationParam);
          const duration = this.allDurations.find(
            (dur) => dur.id === this.selectedDuration
          );
          this.selectedDurationSlug = duration?.slug || null;
        } else {
          // New format: slug
          this.selectedDurationSlug = durationParam;
          const duration = this.allDurations.find(
            (dur) => dur.slug === durationParam
          );
          if (duration) {
            this.selectedDuration = duration.id;
          } else {
            this.selectedDuration = null;
          }
        }
      } else {
        this.selectedDurationSlug = null;
        this.selectedDuration = null;
      }

      // Reload tours with filters from URL
      this.getAllTours();
    });
  }

  getDestination() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        this.allDestinations = res.data.data;

        // If there's a slug from URL but destinations weren't loaded yet
        if (this.selectedDestinationSlug && this.selectedDestination === null) {
          const destination = this.allDestinations.find(
            (dest) => dest.slug === this.selectedDestinationSlug
          );
          if (destination) {
            this.selectedDestination = destination.id;
            this.getAllTours(); // Reload tours
          }
        }
      },
      // error: (err) => console.log(err),
    });
  }

  getCategories() {
    this._DataService.getCategories().subscribe({
      next: (res) => {
        this.allCategories = res.data.data;

        // If there's a slug from URL but categories weren't loaded yet
        if (this.selectedCategorySlug && this.selectedTripType === null) {
          const category = this.allCategories.find(
            (cat) => cat.slug === this.selectedCategorySlug
          );
          if (category) {
            this.selectedTripType = category.id;
            this.getAllTours(); // Reload tours
          }
        }
      },
      // error: (err) => console.log(err),
    });
  }
  getDurations() {
    this._DataService.getToursDuration().subscribe({
      next: (res) => {
        this.allDurations = res.data;

        // If there's a slug from URL but durations weren't loaded yet
        if (this.selectedDurationSlug && this.selectedDuration === null) {
          const duration = this.allDurations.find(
            (dur) => dur.slug === this.selectedDurationSlug
          );
          if (duration) {
            this.selectedDuration = duration.id;
            this.getAllTours(); // Reload tours
          }
        }
      },
      // error: (err) => console.log(err),
    });
  }

  getAllTours(page: number = 1) {
    // Build query parameters with slugs for server-side filtering
    const queryParams: any = {};

    if (this.selectedCategorySlug) {
      queryParams['category_slug'] = this.selectedCategorySlug;
    }

    if (this.selectedDestinationSlug) {
      queryParams['destination_slug'] = this.selectedDestinationSlug;
    }

    if (this.selectedDurationSlug) {
      queryParams['duration_slug'] = this.selectedDurationSlug;
    }

    // Price filter (if needed on server-side, otherwise handled client-side)
    if (this.minBudget > 0) {
      queryParams['min_price'] = this.minBudget;
    }
    if (this.maxBudget < 5000) {
      queryParams['max_price'] = this.maxBudget;
    }

    // Call API with filters
    this._DataService.getTours(queryParams, page).subscribe({
      next: (res) => {
        // Handle response
        if (res.data && res.data.data) {
          this.allTours = res.data.data;

          // Calculate totalItems from API response
          if (res.data.total !== undefined) {
            this.totalItems = Number(res.data.total);
          } else if (res.data.last_page && res.data.per_page) {
            // Calculate from last_page and per_page
            this.totalItems =
              Number(res.data.last_page) * Number(res.data.per_page);
          } else {
            // Fallback: if we have 15 items, there might be more
            this.totalItems =
              res.data.data.length >= 15
                ? res.data.data.length + 1
                : res.data.data.length;
          }

          this.allToursCount = this.totalItems;
        }

        // Process tours: add destinationsTitle
        this.allTours.forEach((tour) => {
          tour.destinationsTitle = tour.destinations
            ?.map((x: any) => x.title)
            .join(', ');
        });

        this.filteredTours = [...this.allTours];
        this.currentPage = page;
      },
      error: (err) => {
        // Handle errors
        this.allTours = [];
        this.filteredTours = [];
        this.totalItems = 0;
        // console.log(err);
      },
    });
  }

  // Client-side price filtering (if price filter is not supported by API)
  filterTours() {
    // Apply price filter on client-side if needed
    let filtered = [...this.allTours];

    // Filter by price range (client-side)
    filtered = filtered.filter((tour) => {
      let price = 0;
      if (tour.start_from) {
        price = Number(tour.start_from);
      } else if (tour.adult_price) {
        price = Number(tour.adult_price);
      } else if (tour.price) {
        price = Number(tour.price);
      }
      return price >= this.minBudget && price <= this.maxBudget;
    });

    this.filteredTours = filtered;
  }

  // Utility methods for radio button selection
  isSelected(
    key: 'selectedTripType' | 'selectedDuration' | 'selectedDestination',
    id: number
  ): boolean {
    return this[key] === id;
  }

  onRadioChange(
    key: 'selectedTripType' | 'selectedDuration' | 'selectedDestination',
    value: number | null
  ) {
    // 1. Update the value
    this[key] = value;

    // 2. Convert ID to Slug
    if (key === 'selectedTripType') {
      if (value !== null) {
        const category = this.allCategories.find((cat) => cat.id === value);
        this.selectedCategorySlug = category?.slug || null;
      } else {
        this.selectedCategorySlug = null;
      }
    } else if (key === 'selectedDuration') {
      if (value !== null) {
        const duration = this.allDurations.find((dur) => dur.id === value);
        this.selectedDurationSlug = duration?.slug || null;
      } else {
        this.selectedDurationSlug = null;
      }
    } else if (key === 'selectedDestination') {
      if (value !== null) {
        const destination = this.allDestinations.find(
          (dest) => dest.id === value
        );
        this.selectedDestinationSlug = destination?.slug || null;
      } else {
        this.selectedDestinationSlug = null;
      }
    }

    // 3. Reload tours from API with new filters
    this.getAllTours();

    // 4. Update URL
    this.updateURL();
  }

  // Legacy method for backward compatibility
  selectRadio(
    key: 'selectedTripType' | 'selectedDuration' | 'selectedDestination',
    id: number
  ) {
    // If clicking the same selected item, deselect it
    if (this[key] === id) {
      this.onRadioChange(key, null);
    } else {
      this.onRadioChange(key, id);
    }
  }


  setLayout(type: 'grid' | 'list') {
    this.layoutType = type;
  }

  // Get current page's item count for display
  getCurrentPageItemsCount(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return Math.min(this.itemsPerPage, this.totalItems - startIndex);
  }

  onPriceRangeChange() {
    // Reload tours with price filter
    this.getAllTours();
    this.updateURL();
  }

  // Method to clear all filters
  clearAllFilters() {
    // Reset all filters
    this.selectedTripType = null;
    this.selectedDestination = null;
    this.selectedDuration = null;
    this.selectedCategorySlug = null;
    this.selectedDestinationSlug = null;
    this.selectedDurationSlug = null;
    this.minBudget = 0;
    this.maxBudget = 5000;

    // Reload tours
    this.getAllTours();

    // Update URL
    this.updateURL();
  }

  // Update URL with current filters
  updateURL() {
    const queryParams: any = {};

    // Add only selected filters to URL
    if (this.selectedDestinationSlug) {
      queryParams['destination'] = this.selectedDestinationSlug;
    }

    if (this.selectedCategorySlug) {
      queryParams['type'] = this.selectedCategorySlug;
    }

    if (this.selectedDurationSlug) {
      queryParams['duration'] = this.selectedDurationSlug;
    }

    // Update URL
    this._Router.navigate([], {
      relativeTo: this._ActivatedRoute,
      queryParams: queryParams,
      queryParamsHandling: '', // Replace all params
      replaceUrl: true, // Don't add to history
    });
  }




  onPageChange(page: number): void {
    // Fetch tours for the new page with current filters
    this.getAllTours(page);
  }

  onSortChange(event: Event) {
    const sortBy = (event.target as HTMLSelectElement).value;

    switch (sortBy) {
      case 'recent':
        this.sortByRecent();
        break;
      // to do best seller , you must have property to check number of seller si 'sales_count'
      // i use display_order [true or false]
      case 'bestseller':
        this.sortByBestSeller();
        break;
      case 'priceLowToHigh':
        this.sortByPriceAsc();
        break;
      case 'priceHighToLow':
        this.sortByPriceDesc();
        break;
      default:
        break;
    }
  }

  sortByBestSeller() {
    // Client-side sorting
    this.filteredTours = [...this.filteredTours].sort(
      (a, b) => (b.display_order || 0) - (a.display_order || 0)
    );
  }

  sortByRecent() {
    // Client-side sorting
    this.filteredTours = [...this.filteredTours].sort((a, b) => b.id - a.id);
  }

  sortByPriceAsc() {
    // Client-side sorting
    this.filteredTours = [...this.filteredTours].sort(
      (a, b) => (a.start_from || 0) - (b.start_from || 0)
    );
  }

  sortByPriceDesc() {
    // Client-side sorting
    this.filteredTours = [...this.filteredTours].sort(
      (a, b) => (b.start_from || 0) - (a.start_from || 0)
    );
  }

  toggleCategoryCollapse() {
    // Close all other sections
    this.isPriceExpanded = false;
    this.isDurationExpanded = false;
    this.isDestinationExpanded = false;
    // Toggle current section
    this.isCategoryExpanded = !this.isCategoryExpanded;
  }

  togglePriceCollapse() {
    // Close all other sections
    this.isCategoryExpanded = false;
    this.isDurationExpanded = false;
    this.isDestinationExpanded = false;
    // Toggle current section
    this.isPriceExpanded = !this.isPriceExpanded;
  }

  toggleDurationCollapse() {
    // Close all other sections
    this.isCategoryExpanded = false;
    this.isPriceExpanded = false;
    this.isDestinationExpanded = false;
    // Toggle current section
    this.isDurationExpanded = !this.isDurationExpanded;
  }

  toggleDestinationCollapse() {
    // Close all other sections
    this.isCategoryExpanded = false;
    this.isPriceExpanded = false;
    this.isDurationExpanded = false;
    // Toggle current section
    this.isDestinationExpanded = !this.isDestinationExpanded;
  }
}

// old html code
/*

<div
          class="sideBar p-3 rounded-3 bg-white text-capitalize textSecondColor"
        >
          <!-- category -->
          <div class="mb-4">
            <h4 class="h5 fw-bold pb-3 border-bottom mb-3">tour category</h4>
            <div
              *ngFor="let type of allCategories"
              class="flexBetween listFilter p-1 rounded-2"
            >
              <mat-checkbox
                class="cPointer"
                [checked]="isChecked('selectedTripType', type.id)"
                (change)="toggle('selectedTripType', type.id, $event.checked)"
              >
                {{ type.title }}
              </mat-checkbox>
              <span class="flexCenter rounded-circle">{{
                type.tours_count
              }}</span>
            </div>
          </div>

          <!-- price -->
          <div class="mb-4">
            <h4 class="h5 fw-bold pb-3 border-bottom mb-3">tour price</h4>
            <div>
              <p class="mb-0 text-capitalize">
                price from:
                <span class="textMainColor"> {{ minBudget | currency }} </span>
                to:
                <span class="textMainColor"> {{ maxBudget | currency }} </span>
              </p>

              <mat-slider class="w-100 mainSliderColor" [min]="0" [max]="9000">
                <input
                  [(ngModel)]="minBudget"
                  name="minBudget"
                  matSliderStartThumb
                  (change)="filterTours()"
                />
                <input
                  [(ngModel)]="maxBudget"
                  name="maxBudget"
                  matSliderEndThumb
                  (change)="filterTours()"
                />
              </mat-slider>
            </div>
          </div>

          <!-- duartion -->
          <div class="mb-4">
            <h4 class="h5 fw-bold pb-3 border-bottom mb-3">Tour Duration</h4>

            <div
              *ngFor="let d of allDurations"
              class="flexBetween listFilter p-1 rounded-2"
            >
              <mat-checkbox
                class="cPointer"
                [checked]="selectedDurationSlug === d.slug"
                (change)="onDurationChange(d.slug, $event.checked)"
              >
                {{ d.title }}
              </mat-checkbox>

              <span class="flexCenter rounded-circle">{{ d.tours_count }}</span>
            </div>
          </div>

          <!-- destination -->
          <div class="mb-4">
            <h4 class="h5 fw-bold pb-3 border-bottom mb-3">tour destination</h4>
            <div
              *ngFor="let dest of allDestinations"
              class="flexBetween listFilter p-2 rounded-2"
            >
              <mat-checkbox
                class="cPointer"
                [checked]="isChecked('selectedDestination', dest.id)"
                (change)="
                  toggle('selectedDestination', dest.id, $event.checked)
                "
              >
                {{ dest.title }}
              </mat-checkbox>
              <span class="flexCenter textMainColor rounded-circle">{{
                dest.tours_count
              }}</span>
            </div>
          </div>
        </div>

*/
