import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class DataService extends BaseService {
  getTours(searchObj?: any, page: number = 1): Observable<any> {
    const params = {
      includes: 'destinations,categories,days',
      ...searchObj,
      page: page,
    };
    return this.HttpClient.get(`${this.baseUrl}/tours`, { params: params });
  }

  getTourPagination(page: number): Observable<any> {
    return this.HttpClient.get(
      `${this.baseUrl}/tours?includes=destinations,categories,days&page=${page}`
    );
  }

  getToursSlug(slug: any): Observable<any> {
    return this.HttpClient.get(
      `${this.baseUrl}/tours/${slug}?includes=destinations,categories,days,seo`
    );
  }

  getTourBySlug(slug: string): Observable<any> {
    return this.getToursSlug(slug);
  }

  getBlogBySlug(slug: string): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/blogs/${slug}?includes=seo`);
  }

  /** Destinations that belong to a parent (child / regional rows only). */
  getDestination(): Observable<any> {
    return this.HttpClient
      .get(`${this.baseUrl}/destinations`)
      .pipe(
        map((res: any) => {
          const rows: any[] = res?.data?.data ?? [];
          const withParent = rows.filter((d) => d.parent_id != null);
          return {
            ...res,
            data: { ...res.data, data: withParent },
          };
        })
      );
  }

  getDestinationBySlug(slug: string): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/destinations/${slug}`, {
      params: { includes: 'seo' },
    });
  }

  getCategories(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/categories`, {
      params: { page_limit: 100 },
    });
  }

  getCategoriesBlog(id?: number): Observable<any> {
    const url = id
      ? `${this.baseUrl}/blog-categories/${id}`
      : `${this.baseUrl}/blog-categories`;
    return this.HttpClient.get(url);
  }

  postReviews(userReview: object, id: number): Observable<any> {
    return this.HttpClient.post(
      `${this.baseUrl}/tour-reviews/${id}`,
      userReview
    );
  }

  getToursDuration(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/durations`);
  }

  getReviews(tourId?: number): Observable<any> {
    const params = tourId ? { tour_id: tourId.toString() } : undefined;
    return this.HttpClient.get(`${this.baseUrl}/tour-reviews`, { params });
  }

  // wishlist
  toggleWishlist(id: number): Observable<any> {
    return this.HttpClient.put(`${this.baseUrl}/wishlist/${id}/toggle`, {});
  }

  getWishlist(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/wishlist`);
  }

  // blogs
  getBlogs(slug?: string): Observable<any> {
    const url = slug
      ? `${this.baseUrl}/blogs/${slug}?includes=seo`
      : `${this.baseUrl}/blogs`;
    return this.HttpClient.get(url);
  }

  // contact
  contactData(contactForm: any): Observable<any> {
    return this.HttpClient.post(
      `${this.baseUrl}/contact-requests`,
      contactForm
    );
  }

  // countries
  getCountries(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/countries`);
  }

  // faqs
  getFAQs(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/faqs`);
  }

  // settings
  getSetting(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/settings`);
  }

  getPages(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/pages`, {
      params: { includes: 'seo' },
    });
  }
}
