import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: any;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private baseUrl = 'https://egygo-travel.com'; // Update with your actual domain

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateSEO(data: SEOData): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Update title
    if (data.title) {
      this.title.setTitle(data.title);
    }

    // Update or create meta tags
    this.updateMetaTag('description', data.description || '');
    this.updateMetaTag('keywords', data.keywords || '');

    // Open Graph tags
    this.updateMetaTag('og:title', data.title || '');
    this.updateMetaTag('og:description', data.description || '');
    this.updateMetaTag('og:image', data.image || '');
    this.updateMetaTag('og:url', data.url || this.baseUrl);
    this.updateMetaTag('og:type', data.type || 'website');

    // Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', data.title || '');
    this.updateMetaTag('twitter:description', data.description || '');
    this.updateMetaTag('twitter:image', data.image || '');

    // Article specific tags
    if (data.type === 'article') {
      if (data.author) {
        this.updateMetaTag('article:author', data.author);
      }
      if (data.publishedTime) {
        this.updateMetaTag('article:published_time', data.publishedTime);
      }
      if (data.modifiedTime) {
        this.updateMetaTag('article:modified_time', data.modifiedTime);
      }
    }

    // Canonical URL
    this.updateCanonicalUrl(data.url || this.baseUrl);

    // Structured Data (JSON-LD)
    if (data.structuredData) {
      this.updateStructuredData(data.structuredData);
    }
  }

  private updateMetaTag(property: string, content: string): void {
    if (!content) return;

    // Remove existing tag
    const existingTag = this.meta.getTag(`property="${property}"`) || 
                       this.meta.getTag(`name="${property}"`);
    if (existingTag) {
      this.meta.removeTagElement(existingTag);
    }

    // Add new tag
    if (property.startsWith('og:') || property.startsWith('article:')) {
      this.meta.addTag({ property, content });
    } else if (property.startsWith('twitter:')) {
      this.meta.addTag({ name: property, content });
    } else {
      this.meta.addTag({ name: property, content });
    }
  }

  private updateCanonicalUrl(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let link: HTMLLinkElement | null = this.document.querySelector(
      "link[rel='canonical']"
    );

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private updateStructuredData(data: any): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove existing structured data
    const existingScript = this.document.querySelector(
      "script[type='application/ld+json']"
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  // Helper method to generate structured data for tours
  generateTourStructuredData(tour: any, baseUrl: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: tour.title,
      description: tour.short_description || tour.description || '',
      image: tour.image || tour.gallery?.[0]?.image || '',
      url: `${baseUrl}/tour/${tour.slug}`,
      offers: {
        '@type': 'Offer',
        price: tour.start_from || tour.adult_price || '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      itinerary: tour.days?.map((day: any, index: number) => ({
        '@type': 'ItemList',
        position: index + 1,
        name: day.title || `Day ${index + 1}`,
        description: day.description || '',
      })),
      aggregateRating: tour.rate
        ? {
            '@type': 'AggregateRating',
            ratingValue: tour.rate,
            reviewCount: tour.reviews_number || 0,
          }
        : undefined,
    };
  }

  // Helper method to generate structured data for blog posts
  generateBlogStructuredData(blog: any, baseUrl: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.short_description || blog.description || '',
      image: blog.image || '',
      datePublished: blog.created_at || new Date().toISOString(),
      dateModified: blog.updated_at || blog.created_at || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'EGYGO Travel',
      },
      publisher: {
        '@type': 'Organization',
        name: 'EGYGO Travel',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/assets/image/logo-egygo.webp`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/${blog.slug}`,
      },
    };
  }

  // Helper method to generate structured data for destinations
  generateDestinationStructuredData(destination: any, baseUrl: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: destination.title,
      description: destination.description || destination.short_description || '',
      image: destination.image || '',
      url: `${baseUrl}/destination/${destination.slug}`,
    };
  }

  // Helper method to generate organization structured data
  generateOrganizationStructuredData(settings: any, baseUrl: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      name: settings.site_title || 'EGYGO Travel',
      description: settings.site_description || 'Your trusted travel partner',
      url: baseUrl,
      logo: `${baseUrl}${settings.logo || '/assets/image/logo-egygo.webp'}`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: settings.phone || '',
        email: settings.email || '',
        contactType: 'Customer Service',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: settings.address || '',
      },
      sameAs: [
        // Add social media URLs if available
      ],
    };
  }
}

