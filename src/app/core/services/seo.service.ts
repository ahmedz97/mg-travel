import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DataService } from './data.service';
import { resolveCmsKeyFromRoute } from '../../config/page-seo.config';

export interface SeoData {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  og_type?: string | null;
  viewport?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_card?: string | null;
  twitter_image?: string | null;
  twitter_creator?: string | null;
  canonical?: string | null;
  robots?: string | null;
  structure_schema?: string | null;
}

interface UpdateSeoOptions {
  useHomeDefaults?: boolean;
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

  applyHomeSeo(): void {
    this.dataService.getSetting().subscribe({
      next: (res) => {
        const settings = res?.data;
        const seoData = Array.isArray(settings)
          ? this.extractSeoFromSettings(settings, this.getCurrentLanguage())
          : {};
        this.updateSeoData(seoData, { useHomeDefaults: true });
      },
      error: () => this.updateSeoData({}, { useHomeDefaults: true }),
    });
  }

  applyPageSeoByRoute(routePath: string): void {
    this.applyPageSeo(resolveCmsKeyFromRoute(routePath));
  }

  applyPageSeo(pageKey: string): void {
    this.getPages().subscribe({
      next: (pages) => {
        const page = this.findPageByKey(pages, pageKey);
        if (page?.seo) {
          this.updateSeoData(this.normalizeApiSeo(page.seo), {
            useHomeDefaults: false,
          });
        } else {
          this.updateSeoData({}, { useHomeDefaults: false });
        }
      },
      error: () => this.updateSeoData({}, { useHomeDefaults: false }),
    });
  }

  applyEntitySeo(rawSeo: unknown): void {
    this.updateSeoData(this.normalizeApiSeo(rawSeo), { useHomeDefaults: false });
  }

  applyEmptySeo(): void {
    this.updateSeoData({}, { useHomeDefaults: false });
  }

  updateSeoData(seoData: SeoData, options: UpdateSeoOptions = {}): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const useHomeDefaults = options.useHomeDefaults ?? false;

    const title =
      seoData.meta_title ||
      seoData.og_title ||
      (useHomeDefaults ? this.defaultTitle : '');
    const description =
      seoData.meta_description ||
      seoData.og_description ||
      (useHomeDefaults ? this.defaultDescription : '');
    const keywords = seoData.meta_keywords ?? '';
    const robots = seoData.robots ?? (useHomeDefaults ? 'index, follow' : '');
    const canonical = seoData.canonical ?? '';

    const ogTitle = seoData.og_title || title;
    const ogDescription = seoData.og_description || description;
    const ogImageRaw =
      seoData.og_image ||
      seoData.twitter_image ||
      (useHomeDefaults ? this.defaultImage : '');
    const ogType = seoData.og_type ?? (useHomeDefaults ? 'website' : '');
    const ogUrl = canonical || (useHomeDefaults ? this.getCurrentUrl() : '');

    const twitterCard =
      seoData.twitter_card ?? (useHomeDefaults ? 'summary_large_image' : '');
    const twitterTitle = seoData.twitter_title || title;
    const twitterDescription = seoData.twitter_description || description;
    const twitterImageRaw = seoData.twitter_image || ogImageRaw;
    const twitterCreator = seoData.twitter_creator ?? '';

    this.title.setTitle(title);

    this.setMetaTag('name', 'description', description);
    this.setMetaTag('name', 'keywords', keywords);
    this.setMetaTag('name', 'robots', robots);

    if (seoData.viewport) {
      this.setMetaTag('name', 'viewport', seoData.viewport);
    }

    this.setMetaTag('property', 'og:title', ogTitle);
    this.setMetaTag('property', 'og:description', ogDescription);
    this.setMetaTag('property', 'og:image', this.getFullImageUrl(ogImageRaw));
    this.setMetaTag('property', 'og:type', ogType);
    this.setMetaTag('property', 'og:url', ogUrl);

    this.setMetaTag('name', 'twitter:card', twitterCard);
    this.setMetaTag('name', 'twitter:title', twitterTitle);
    this.setMetaTag('name', 'twitter:description', twitterDescription);
    this.setMetaTag(
      'name',
      'twitter:image',
      this.getFullImageUrl(twitterImageRaw)
    );
    this.setMetaTag('name', 'twitter:creator', twitterCreator);

    if (canonical) {
      this.updateCanonicalUrl(canonical);
    } else {
      this.removeCanonicalUrl();
    }

    if (seoData.structure_schema) {
      this.updateStructuredData(seoData.structure_schema);
    } else {
      this.removeStructuredData();
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
      'viewport',
      'twitter_title',
      'twitter_description',
      'twitter_card',
      'twitter_image',
      'twitter_creator',
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

    const seoSetting = (
      settingsResponse as Array<{
        option_key?: string;
        option_value?: Record<string, unknown>;
      }>
    ).find((item) => item.option_key === 'seo');

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
      'viewport',
      'twitter_creator',
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

  findPageByKey(
    pages: unknown[],
    key: string
  ): { key?: string; seo?: unknown } | null {
    if (!pages?.length) {
      return null;
    }

    const normalizedKey = key.toLowerCase();
    const typedPages = pages as Array<{ key?: string; seo?: unknown }>;
    return (
      typedPages.find((page) => page.key?.toLowerCase() === normalizedKey) ??
      null
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
    this.updateSeoData({}, { useHomeDefaults: true });
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

  private setMetaTag(
    attr: 'name' | 'property',
    key: string,
    content: string
  ): void {
    this.meta.updateTag({ [attr]: key, content: content ?? '' });
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

  private removeCanonicalUrl(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document.querySelector("link[rel='canonical']")?.remove();
  }

  private updateStructuredData(schema: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.removeStructuredData();

    try {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = schema;
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error adding structured data:', error);
    }
  }

  private removeStructuredData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document
      .querySelector('script[type="application/ld+json"]')
      ?.remove();
  }

  private getFullImageUrl(image: string): string {
    if (!image) {
      return '';
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
