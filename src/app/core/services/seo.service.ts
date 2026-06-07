import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DataService } from './data.service';
import { PAGE_SEO_ROUTE_KEYS } from '../../config/page-seo.config';

export interface SeoData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_card?: string;
  twitter_image?: string;
  canonical?: string;
  robots?: string;
  structure_schema?: string;
}

export interface SeoFallbacks {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  structure_schema?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private defaultTitle = environment.seo.defaultTitle;
  private defaultDescription = environment.seo.defaultDescription;
  private defaultImage = environment.seo.defaultImage;
  private siteUrl = environment.siteUrl;
  private pagesCache$: Observable<any[]> | null = null;

  constructor(
    private meta: Meta,
    private title: Title,
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  applyHomeSeo(fallbacks: SeoFallbacks = {}): void {
    this.dataService.getSetting().subscribe({
      next: (res) => {
        const settings = res?.data;
        const seoData = Array.isArray(settings)
          ? this.extractSeoFromSettings(settings, this.getCurrentLanguage())
          : {};
        this.updateSeoData(seoData, fallbacks);
      },
      error: () => this.updateSeoData({}, fallbacks),
    });
  }

  applyPageSeoByRoute(routePath: string, fallbacks: SeoFallbacks = {}): void {
    const pageKey = PAGE_SEO_ROUTE_KEYS[routePath] ?? routePath;
    this.applyPageSeo(pageKey, fallbacks);
  }

  applyPageSeo(pageKey: string, fallbacks: SeoFallbacks = {}): void {
    this.getPages().subscribe({
      next: (pages) => {
        const page = this.findPageByKey(pages, pageKey);
        if (page?.seo) {
          this.updateSeoData(
            this.normalizeApiSeo(page.seo),
            {
              title: page.title ? `${page.title} - ${environment.seo.siteName}` : fallbacks.title,
              description: page.short_description || fallbacks.description,
              ...fallbacks,
            }
          );
          return;
        }
        this.applySettingsSeo(fallbacks);
      },
      error: () => this.applySettingsSeo(fallbacks),
    });
  }

  applySettingsSeo(fallbacks: SeoFallbacks = {}): void {
    this.dataService.getSetting().subscribe({
      next: (res) => {
        const settings = res?.data;
        const seoData = Array.isArray(settings)
          ? this.extractSeoFromSettings(settings, this.getCurrentLanguage())
          : {};
        this.updateSeoData(seoData, fallbacks);
      },
      error: () => this.updateSeoData({}, fallbacks),
    });
  }

  applyEntitySeo(rawSeo: unknown, fallbacks: SeoFallbacks = {}): void {
    this.updateSeoData(this.normalizeApiSeo(rawSeo), fallbacks);
  }

  updateSeoData(seoData: SeoData, fallbacks: SeoFallbacks = {}): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const title =
      seoData.meta_title ||
      seoData.og_title ||
      fallbacks.title ||
      this.defaultTitle;
    const description =
      seoData.meta_description ||
      seoData.og_description ||
      fallbacks.description ||
      this.defaultDescription;
    const image =
      seoData.og_image ||
      seoData.twitter_image ||
      fallbacks.image ||
      this.defaultImage;
    const keywords = seoData.meta_keywords || fallbacks.keywords || '';
    const canonical = seoData.canonical || fallbacks.canonical || '';
    const robots = seoData.robots || fallbacks.robots || 'index, follow';

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ name: 'robots', content: robots });

    this.meta.updateTag({
      property: 'og:title',
      content: seoData.og_title || title,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: seoData.og_description || description,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: this.getFullImageUrl(image),
    });
    this.meta.updateTag({
      property: 'og:type',
      content: seoData.og_type || 'website',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: canonical || this.getCurrentUrl(),
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: seoData.twitter_card || 'summary_large_image',
    });
    this.meta.updateTag({
      name: 'twitter:title',
      content: seoData.twitter_title || title,
    });
    this.meta.updateTag({
      name: 'twitter:description',
      content: seoData.twitter_description || description,
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: this.getFullImageUrl(seoData.twitter_image || image),
    });

    if (canonical) {
      this.updateCanonicalUrl(canonical);
    }

    const schema = seoData.structure_schema || fallbacks.structure_schema;
    if (schema) {
      this.updateStructuredData(schema);
    }
  }

  normalizeApiSeo(raw: unknown): SeoData {
    if (!raw || typeof raw !== 'object') {
      return {};
    }

    const seoData: SeoData = {};
    const source = raw as Record<string, unknown>;

    const fields: (keyof SeoData)[] = [
      'meta_title',
      'meta_description',
      'meta_keywords',
      'og_title',
      'og_description',
      'og_image',
      'og_type',
      'twitter_title',
      'twitter_description',
      'twitter_card',
      'twitter_image',
      'canonical',
      'robots',
      'structure_schema',
    ];

    for (const field of fields) {
      const value = source[field];
      if (value != null && value !== '') {
        seoData[field] = String(value);
      }
    }

    return seoData;
  }

  extractSeoFromSettings(
    settingsResponse: unknown[],
    language: string = 'en'
  ): SeoData {
    if (!settingsResponse || !Array.isArray(settingsResponse)) {
      return {};
    }

    const seoSetting = (settingsResponse as Array<{ option_key?: string; option_value?: Record<string, unknown> }>).find(
      (item) => item.option_key === 'seo'
    );

    if (!seoSetting?.option_value) {
      return {};
    }

    const seoValue = seoSetting.option_value;
    const langData = (seoValue[language] || seoValue['en'] || {}) as Record<
      string,
      unknown
    >;

    const seoData: SeoData = {};

    const langFields: (keyof SeoData)[] = [
      'meta_title',
      'meta_description',
      'meta_keywords',
      'og_title',
      'og_description',
      'twitter_title',
      'twitter_description',
      'canonical',
      'structure_schema',
    ];

    for (const field of langFields) {
      const value = langData[field];
      if (value != null && value !== '') {
        seoData[field] = String(value);
      }
    }

    if (seoValue['robots']) seoData.robots = String(seoValue['robots']);
    if (seoValue['og_type']) seoData.og_type = String(seoValue['og_type']);
    if (seoValue['twitter_card']) {
      seoData.twitter_card = String(seoValue['twitter_card']);
    }

    return seoData;
  }

  findPageByKey(pages: unknown[], key: string): { key?: string; title?: string; short_description?: string; seo?: unknown } | null {
    if (!pages?.length) {
      return null;
    }

    const normalizedKey = key.toLowerCase();
    const typedPages = pages as Array<{ key?: string; title?: string; short_description?: string; seo?: unknown }>;
    return (
      typedPages.find((page) => page.key?.toLowerCase() === normalizedKey) ?? null
    );
  }

  getCurrentLanguage(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'en';
    }
    return localStorage.getItem('language') || 'en';
  }

  getCmsPageKeys(): Observable<string[]> {
    return this.getPages().pipe(
      map((pages) =>
        pages
          .map((page: { key?: string }) => page.key)
          .filter((key): key is string => !!key)
      )
    );
  }

  clearPagesCache(): void {
    this.pagesCache$ = null;
  }

  resetToDefaults(): void {
    this.updateSeoData({}, {});
  }

  private getPages(): Observable<any[]> {
    if (!this.pagesCache$) {
      this.pagesCache$ = this.dataService.getPages().pipe(
        map((res) => res?.data?.data ?? []),
        shareReplay(1)
      );
    }
    return this.pagesCache$;
  }

  private updateCanonicalUrl(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let link: HTMLLinkElement | null = document.querySelector(
      "link[rel='canonical']"
    );
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private updateStructuredData(schema: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const existingScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    try {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = schema;
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error adding structured data:', error);
    }
  }

  private getFullImageUrl(image: string): string {
    if (!image) {
      return `${this.siteUrl}${this.defaultImage}`;
    }
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    if (image.startsWith('/')) {
      return `${this.siteUrl}${image}`;
    }
    return `${this.siteUrl}/${image}`;
  }

  private getCurrentUrl(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return `${this.siteUrl}/`;
    }
    return window.location.href;
  }
}
