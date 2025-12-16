import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
    private _SeoService: SeoService
  ) {}

  bannerTitle: string = 'tour search';

  // pagination
  itemsPerPage: number = 9;
  currentPage: number = 1;
  totalItems: number = 0;

  layoutType: 'grid' | 'list' = 'grid';
  minBudget = 0;
  maxBudget = 5000;

  selectedDestination: number | null = null;
  selectedTripType: number | null = null;
  selectedTripTypeSlug: string | null = null; // Store slug temporarily
  selectedDuration: number | null = null;

  selectedDurationSlug: string | null = null;

  allCategories: any[] = [];
  allDestinations: any[] = [];
  allDurations: any[] = [];
  allTours: any[] = [];
  filteredTours: any[] = [];
  categoriesWithTours: any[] = []; // Store categories with included tours

  allToursRaw: any[] = []; // النسخة الخام من API بدون فلاتر

  ngOnInit(): void {
    this._SeoService.updateSeoData(
      {},
      'Tour Search - MG Travel',
      'Find the perfect tour for your next adventure with MG Travel. Browse our wide selection of tours and destinations.',
      '../../../assets/image/logo-MG-Travel.webp'
    );
    this.getDestination();
    this.getCategories(); // This now includes tours data
    this.getDurations();
    this._ActivatedRoute.queryParams.subscribe((param) => {
      // console.log('params', param);

      this.selectedDestination = param['location']
        ? Number(param['location'])
        : null;

      // Handle category slug or ID
      if (param['type']) {
        const typeParam = param['type'];
        // Check if it's a slug (string) or ID (number)
        if (typeof typeParam === 'string' && isNaN(Number(typeParam))) {
          // It's a slug
          this.selectedTripTypeSlug = typeParam;
          // Try to find category and convert to ID
          const category = this.allCategories.find(
            (cat: any) => cat.slug === typeParam
          );
          if (category) {
            this.selectedTripType = category.id;
            this.selectedTripTypeSlug = null; // Clear after conversion
          }
        } else {
          // It's an ID (number or numeric string)
          this.selectedTripType = Number(typeParam);
          this.selectedTripTypeSlug = null;
        }
      } else {
        this.selectedTripType = null;
        this.selectedTripTypeSlug = null;
      }

      this.selectedDuration = param['duration']
        ? Number(param['duration'])
        : null;
      this.filterTours();
    });
  }

  getDestination() {
    this._DataService.getDestination().subscribe({
      next: (res) => (this.allDestinations = res.data.data),
      // error: (err) => console.log(err),
    });
  }

  getCategories() {
    this._DataService.getCategories().subscribe({
      next: (res) => {
        this.allCategories = res.data.data;
        this.categoriesWithTours = res.data.data;

        // Extract all tours from categories and store them
        this.allTours = [];
        const tourCategoryMap = new Map(); // Track which categories each tour belongs to

        this.categoriesWithTours.forEach((category) => {
          if (category.tours && Array.isArray(category.tours)) {
            category.tours.forEach((tour: any) => {
              // Check if tour already exists
              const existingTour = this.allTours.find(
                (existingTour) => existingTour.id === tour.id
              );

              if (!existingTour) {
                // Add category information to tour for easier filtering
                tour.category_ids = [category.id];
                tour.category_slugs = [category.slug];
                tour.category_titles = [category.title];
                this.allTours.push(tour);
                tourCategoryMap.set(tour.id, [category.id]);
              } else {
                // Tour already exists, add this category to its list
                if (!existingTour.category_ids.includes(category.id)) {
                  existingTour.category_ids.push(category.id);
                  if (!existingTour.category_slugs) {
                    existingTour.category_slugs = [];
                  }
                  existingTour.category_slugs.push(category.slug);
                  existingTour.category_titles.push(category.title);
                  tourCategoryMap.get(tour.id).push(category.id);
                }
              }
            });
          }
        });

        this.filteredTours = [...this.allTours];
        this.totalItems = this.allTours.length;
        // console.log('=== CATEGORIES LOADED ===');
        // console.log('All categories:', this.allCategories);
        // console.log('Categories with tours:', this.categoriesWithTours);
        // console.log('All tours from categories:', this.allTours);
        // console.log('Tour category mapping:', tourCategoryMap);
        // console.log('========================');

        // If there's a pending slug, convert it to ID now that categories are loaded
        if (this.selectedTripTypeSlug) {
          const category = this.allCategories.find(
            (cat: any) => cat.slug === this.selectedTripTypeSlug
          );
          if (category) {
            this.selectedTripType = category.id;
            this.selectedTripTypeSlug = null;
            this.filterTours();
          }
        }

        // If no tours found in categories, get all tours as fallback
        if (this.allTours.length === 0) {
          // console.log('No tours found in categories, fetching all tours...');
          this.getAllTours();
        }
      },
      // error: (err) => console.log(err),
    });
  }
  getDurations() {
    this._DataService.getToursDuration().subscribe({
      next: (res) => {
        this.allDurations = res.data;
        // console.log(this.allDurations);
      },
      // error: (err) => console.log(err),
    });
  }

  getAllTours() {
    // Fallback method to get all tours if categories don't include them
    this._DataService.getTours().subscribe({
      next: (res) => {
        this.allTours = res.data.data;
        this.filteredTours = [...this.allTours];
        this.totalItems = this.allTours.length;
        // console.log('Fallback: All tours loaded:', this.allTours);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  filterTours() {
    // Use client-side filtering instead of API calls for better performance
    let filtered = [...this.allTours];

    // Filter by selected categories (by ID or slug)
    if (this.selectedTripType !== null || this.selectedTripTypeSlug) {
      filtered = filtered.filter((tour) => {
        // If filtering by slug
        if (this.selectedTripTypeSlug) {
          // Check if tour has category_slugs array (added during extraction)
          if (tour.category_slugs && Array.isArray(tour.category_slugs)) {
            return tour.category_slugs.includes(this.selectedTripTypeSlug);
          }
          // Check if tour has categories array with slugs
          if (tour.categories && Array.isArray(tour.categories)) {
            return tour.categories.some(
              (cat: any) => cat.slug === this.selectedTripTypeSlug
            );
          }
        }

        // If filtering by ID
        if (this.selectedTripType !== null) {
          // Check if tour has category_ids array (added during extraction)
          if (tour.category_ids && Array.isArray(tour.category_ids)) {
            return tour.category_ids.includes(this.selectedTripType);
          }
          // Check if tour has categories array (from regular API calls)
          if (tour.categories && Array.isArray(tour.categories)) {
            return tour.categories.some(
              (cat: any) => cat.id === this.selectedTripType
            );
          }
          // Check if tour has pivot with category_id (from included tours data)
          if (tour.pivot && tour.pivot.category_id) {
            return tour.pivot.category_id === this.selectedTripType;
          }
          // Check if tour has single category_id (legacy support)
          if (tour.category_id) {
            return tour.category_id === this.selectedTripType;
          }
        }
        return false;
      });
    }

    // Filter by selected destinations
    if (this.selectedDestination !== null) {
      filtered = filtered.filter((tour) => {
        return (
          tour.destinations &&
          tour.destinations.some(
            (dest: any) => dest.id === this.selectedDestination
          )
        );
      });
    }

    // Filter by selected durations
    if (this.selectedDuration !== null) {
      filtered = filtered.filter((tour) => {
        // Check if tour has duration_in_days property
        if (tour.duration_in_days) {
          return tour.duration_in_days === this.selectedDuration;
        }
        // Check if tour has days array
        if (tour.days && Array.isArray(tour.days)) {
          return tour.days.length === this.selectedDuration;
        }
        // Check if tour has duration property
        if (tour.duration) {
          const durationNum = Number(tour.duration);
          return !isNaN(durationNum) && durationNum === this.selectedDuration;
        }
        return false;
      });
    }

    // Filter by price range
    filtered = filtered.filter((tour) => {
      // Try different price properties
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
    // Update pagination
    this.totalItems = filtered.length;
    this.currentPage = 1;

    // console.log('=== FILTERING RESULTS ===');
    // console.log('Selected categories:', this.selectedTripType);
    // console.log('Selected destinations:', this.selectedDestination);
    // console.log('Selected durations:', this.selectedDuration);
    // console.log('Price range:', this.minBudget, '-', this.maxBudget);
    // console.log('Total tours before filtering:', this.allTours.length);
    // console.log('Total tours after filtering:', filtered.length);
    // console.log('Filtered tours:', this.filteredTours);
    // console.log('========================');
  }

  // Utility methods for radio button selection
  isSelected(
    key: 'selectedTripType' | 'selectedDuration' | 'selectedDestination',
    id: number
  ): boolean {
    return this[key] === id;
  }

  selectRadio(
    key: 'selectedTripType' | 'selectedDuration' | 'selectedDestination',
    id: number
  ) {
    // If clicking the same selected item, deselect it
    if (this[key] === id) {
      this[key] = null;
    } else {
      this[key] = id;
    }

    // If this is a category and no tours are found, try to get tours for this category
    if (key === 'selectedTripType' && this[key] !== null) {
      const categoryHasTours = this.allTours.some(
        (tour) =>
          tour.category_ids && tour.category_ids.includes(this[key] as number)
      );
      if (!categoryHasTours) {
        // console.log(`No tours found for category ${id}, fetching...`);
        this.getToursForCategory(id);
      }
    }

    this.filterTours();
  }

  // Calculate dynamic counts for categories
  getCategoryCount(categoryId: number): number {
    // Get tours that match other filters (excluding category filter)
    let filtered = [...this.allTours];

    // Apply destination filter if set
    if (this.selectedDestination !== null) {
      filtered = filtered.filter((tour) => {
        return (
          tour.destinations &&
          tour.destinations.some(
            (dest: any) => dest.id === this.selectedDestination
          )
        );
      });
    }

    // Apply duration filter if set
    if (this.selectedDuration !== null) {
      filtered = filtered.filter((tour) => {
        if (tour.duration_in_days) {
          return tour.duration_in_days === this.selectedDuration;
        }
        if (tour.days && Array.isArray(tour.days)) {
          return tour.days.length === this.selectedDuration;
        }
        if (tour.duration) {
          const durationNum = Number(tour.duration);
          return !isNaN(durationNum) && durationNum === this.selectedDuration;
        }
        return false;
      });
    }

    // Apply price filter
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

    // Count tours in this category
    return filtered.filter((tour) => {
      if (tour.category_ids && Array.isArray(tour.category_ids)) {
        return tour.category_ids.includes(categoryId);
      }
      if (tour.categories && Array.isArray(tour.categories)) {
        return tour.categories.some((cat: any) => cat.id === categoryId);
      }
      if (tour.pivot && tour.pivot.category_id) {
        return tour.pivot.category_id === categoryId;
      }
      if (tour.category_id) {
        return tour.category_id === categoryId;
      }
      return false;
    }).length;
  }

  // Calculate dynamic counts for destinations
  getDestinationCount(destinationId: number): number {
    // Get tours that match other filters (excluding destination filter)
    let filtered = [...this.allTours];

    // Apply category filter if set
    if (this.selectedTripType !== null) {
      filtered = filtered.filter((tour) => {
        if (tour.category_ids && Array.isArray(tour.category_ids)) {
          return tour.category_ids.includes(this.selectedTripType as number);
        }
        if (tour.categories && Array.isArray(tour.categories)) {
          return tour.categories.some(
            (cat: any) => cat.id === this.selectedTripType
          );
        }
        if (tour.pivot && tour.pivot.category_id) {
          return tour.pivot.category_id === this.selectedTripType;
        }
        if (tour.category_id) {
          return tour.category_id === this.selectedTripType;
        }
        return false;
      });
    }

    // Apply duration filter if set
    if (this.selectedDuration !== null) {
      filtered = filtered.filter((tour) => {
        if (tour.duration_in_days) {
          return tour.duration_in_days === this.selectedDuration;
        }
        if (tour.days && Array.isArray(tour.days)) {
          return tour.days.length === this.selectedDuration;
        }
        if (tour.duration) {
          const durationNum = Number(tour.duration);
          return !isNaN(durationNum) && durationNum === this.selectedDuration;
        }
        return false;
      });
    }

    // Apply price filter
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

    // Count tours in this destination
    return filtered.filter((tour) => {
      return (
        tour.destinations &&
        tour.destinations.some((dest: any) => dest.id === destinationId)
      );
    }).length;
  }

  // Calculate dynamic counts for durations
  getDurationCount(durationId: number): number {
    // Get tours that match other filters (excluding duration filter)
    let filtered = [...this.allTours];

    // Apply category filter if set
    if (this.selectedTripType !== null) {
      filtered = filtered.filter((tour) => {
        if (tour.category_ids && Array.isArray(tour.category_ids)) {
          return tour.category_ids.includes(this.selectedTripType as number);
        }
        if (tour.categories && Array.isArray(tour.categories)) {
          return tour.categories.some(
            (cat: any) => cat.id === this.selectedTripType
          );
        }
        if (tour.pivot && tour.pivot.category_id) {
          return tour.pivot.category_id === this.selectedTripType;
        }
        if (tour.category_id) {
          return tour.category_id === this.selectedTripType;
        }
        return false;
      });
    }

    // Apply destination filter if set
    if (this.selectedDestination !== null) {
      filtered = filtered.filter((tour) => {
        return (
          tour.destinations &&
          tour.destinations.some(
            (dest: any) => dest.id === this.selectedDestination
          )
        );
      });
    }

    // Apply price filter
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

    // Count tours with this duration
    return filtered.filter((tour) => {
      if (tour.duration_in_days) {
        return tour.duration_in_days === durationId;
      }
      if (tour.days && Array.isArray(tour.days)) {
        return tour.days.length === durationId;
      }
      if (tour.duration) {
        const durationNum = Number(tour.duration);
        return !isNaN(durationNum) && durationNum === durationId;
      }
      return false;
    }).length;
  }

  setLayout(type: 'grid' | 'list') {
    this.layoutType = type;
  }

  onPriceRangeChange() {
    this.filterTours();
  }

  // Method to clear all filters
  clearAllFilters() {
    this.selectedTripType = null;
    this.selectedDestination = null;
    this.selectedDuration = null;
    this.selectedTripTypeSlug = null;
    this.minBudget = 0;
    this.maxBudget = 5000;
    this.filterTours();
    // console.log('All filters cleared');
  }

  // Method to get tours for a specific category if not found in included data
  getToursForCategory(categoryId: number) {
    const query = { category_id: categoryId };
    this._DataService.getTours(query).subscribe({
      next: (res) => {
        const categoryTours = res.data.data;
        const category = this.allCategories.find(
          (cat) => cat.id === categoryId
        );
        // Add these tours to our existing tours if they don't already exist
        categoryTours.forEach((tour: any) => {
          if (
            !this.allTours.find((existingTour) => existingTour.id === tour.id)
          ) {
            tour.category_ids = [categoryId];
            if (category) {
              tour.category_slugs = [category.slug];
            }
            tour.category_titles = [category?.title || ''];
            this.allTours.push(tour);
          }
        });
        this.filterTours();
        // console.log(`Tours loaded for category ${categoryId}:`, categoryTours);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  // getDurations() {
  //   this._DataService.getToursDuration().subscribe({
  //     next: (res) => {
  //       this.allDurations = res.data;
  //       console.log(this.allDurations);
  //       this.selectedDurationSlug = null;
  //       this.applyDurationFilter();
  //     },
  //     // error: (err) => console.log(err),
  //   });
  // }

  // onDurationChange(slug: string, checked: boolean) {
  //   if (checked) this.getTourDuration(slug);
  //   else if (this.selectedDurationSlug === slug)
  //     this.selectedDurationSlug = null;
  // }

  // getTourDuration(durationSlug: string) {
  //   this.selectedDurationSlug = durationSlug;
  //   const match = this.allDurations?.find((d: any) => d.slug === durationSlug);
  //   this.applyDurationFilter();
  // }

  // private applyDurationFilter() {
  //   let list = this.allToursRaw;

  //   if (this.selectedDurationSlug) {
  //     const match = this.allDurations?.find(
  //       (d: any) => d.slug === this.selectedDurationSlug
  //     );
  //     if (match && Array.isArray(match.tours)) {
  //       list = match.tours; // <-- المطلوب: allTours = match.tours
  //     }
  //   }

  //   // حوّل القائمة النهائية إلى allTours + ضِف destinationsTitle
  //   this.allTours = list.map((t: any) => ({
  //     ...t,
  //     destinationsTitle: Array.isArray(t.destinations)
  //       ? t.destinations.map((x: any) => x.title).join(',')
  //       : '',
  //   }));

  //   this.filteredTours = [...this.allTours];
  //   // لو عايز تعكس الفلتر في الباجينيشن
  //   this.totalItems = this.allTours.length;
  //   this.currentPage = 1;
  // }

  // getTourSearch(params: any) {
  //   const query: any = {};
  //   if (params.location) query['destination_id'] = params.location;
  //   if (params.type) query['category_id'] = params.type;

  //   this._DataService.getTours(query).subscribe({
  //     next: (res) => {
  //       this.allTours = res.data.data;
  //       this.itemsPerPage = res.data.per_page;
  //       this.currentPage = res.data.current_page;
  //       this.totalItems = res.data.total;

  //       for (let i = 0; i < this.allTours.length; i++) {
  //         this.allTours[i].destinationsTitle = this.allTours[i].destinations
  //           .map((x: any) => x.title)
  //           .join(',');
  //       }

  //       if (this.selectedDurationSlug) {
  //         this.applyDurationFilter(); // keeps your duration logic
  //       } else {
  //         this.filteredTours = [...this.allTours];
  //       }

  //       // ✅ now apply budget range on whatever filteredTours currently is
  //       this.applyBudgetFilter();

  //       console.log('filteredTours:', this.filteredTours);
  //     },
  //     error: (err) => console.error(err),
  //   });
  // }

  // choose the correct field name used in your tour object:
  // private pickPrice(t: any): number {
  //   // adjust if your API uses a different key
  //   const raw = t?.start_from ?? t?.price_from ?? t?.starting_price ?? 0;
  //   const n = Number(raw);
  //   return Number.isFinite(n) ? n : 0;
  // }

  // private applyBudgetFilter(): void {
  //   const min = Number(this.minBudget ?? 0);
  //   const max = Number(this.maxBudget ?? Number.POSITIVE_INFINITY);

  //   // base list to filter is whatever you already put in filteredTours
  //   const base = Array.isArray(this.filteredTours) ? this.filteredTours : [];

  //   this.filteredTours = base.filter((t) => {
  //     const price = this.pickPrice(t);
  //     return price >= min && price <= max;
  //   });

  //   // (optional) keep pagination in sync with current filter
  //   this.totalItems = this.filteredTours.length;
  //   this.currentPage = 1;
  // }

  // checkbox button
  // finish checkbox

  // filterTours() {
  //   this.getTourSearch({
  //     location: this.selectedDestination,
  //     type: this.selectedTripType,
  //     // duration: this.selectedDuration,
  //     min_price: this.minBudget,
  //     max_price: this.maxBudget,
  //     page: this.currentPage,
  //   });

  //   }

  getTourPage(page: number): void {
    this._DataService.getTourPagination(page).subscribe({
      next: (res) => {
        this.allTours = res.data.data;
        this.totalItems = res.data.total;
        this.currentPage = page;
        // console.log(this.itemsPerPage, this.totalItems, this.currentPage);
        // console.log(res.data);

        this.allTours.forEach((tour) => {
          tour.destinationsTitle = tour.destinations
            ?.map((x: any) => x.title)
            .join(', ');
        });
        this.filteredTours = [...this.allTours];
      },
      error: (err) => console.error(err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // console.log(page);
    this.filterTours();
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
    this.filteredTours = [...this.allTours].sort(
      (a, b) => b.display_order - a.display_order
    );
    // console.log(this.filteredTours);
  }

  sortByRecent() {
    this.filteredTours = [...this.allTours].sort((a, b) => b.id - a.id);
    // console.log(this.filteredTours);
  }

  sortByPriceAsc() {
    this.filteredTours = [...this.allTours].sort(
      (a, b) => a.start_from - b.start_from
    );
    // console.log(this.filteredTours);
  }

  sortByPriceDesc() {
    this.filteredTours = [...this.allTours].sort(
      (a, b) => b.start_from - a.start_from
    );
    // console.log(this.filteredTours);
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
