export interface Itour {
  id: number;
  slug: string;
  title: string;
  code: string;
  type: string;
  start_from: number;
  adult_price: number;
  child_price: number;
  infant_price: number;
  duration: string;
  duration_in_days: number;
  pickup_time: string;
  run: string;
  featured: boolean;
  enabled: boolean;
  display_order: number;
  featured_image: string;
  gallery: string[];
  overview: string;
  overview_text: string;
  highlights: string;
  included: string;
  excluded: string;
  rate: number;
  reviews_number: number;
  destinationsTitle: string;
  destinations: Destination[];
  categories: Category[];
  pricing_groups: PricingGroup[];
  calender_availability: {
    day_numbers: number[];
    day_names: string[];
    month_names: string[];
    years: number[];
  };
  days: Day[];
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  description: string;
  banner: string;
  featured_image: string;
  gallery: string[];
  display_order: number;
  enabled: boolean;
  featured: boolean;
  parent_id: number;
  tours_count: number;
  pivot: {
    tour_id: number;
    category_id: number;
  };
}

export interface Day {
  id: number;
  tour_id: number;
  title: string;
  description: string;
  display_order?: number;
  translations?: any[]; // You can define a detailed Translation interface if needed
}

export interface Destination {
  id: number;
  title: string;
  slug: string;
  description: string;
  banner: string;
  featured_image: string;
  gallery: string[] | null;
  display_order: number;
  enabled: boolean;
  featured: boolean;
  global: boolean;
  parent_id: number;
  tours_count: number;
  pivot: {
    tour_id: number;
    destination_id: number;
  };
}

export interface PricingGroup {
  from: number;
  to: number;
  price: number;
  child_price: number;
}
