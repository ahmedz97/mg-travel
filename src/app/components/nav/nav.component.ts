import {
  Component,
  HostListener,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  UrlTree,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { SocialComponent } from '../social/social.component';
import { AuthService } from '../../core/services/auth.service';

export type NavMainItem =
  | { kind: 'route'; path: string; labelKey: string; linkExact?: boolean }
  | { kind: 'egyptTours' }
  | { kind: 'globalTours' };

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
    // SocialComponent,
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _AuthService: AuthService,
    private _Router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    public translate: TranslateService
  ) {}

  /** Home → Egypt tours → Global tours → About → Blogs → Contact */
  navMainItems: NavMainItem[] = [
    { kind: 'route', path: '/', labelKey: 'nav.home', linkExact: true },
    { kind: 'egyptTours' },
    { kind: 'globalTours' },
    { kind: 'route', path: '/about', labelKey: 'nav.about' },
    { kind: 'route', path: '/blog', labelKey: 'nav.blogs' },
    { kind: 'route', path: '/contact', labelKey: 'nav.contact' },
  ];

  isSidebarOpen = false;
  allDestinations: any[] = [];
  allCategories: any[] = [];
  egyptCategories: any[] = [];

  isHovered = false;
  logo: any;
  phoneNunmber: any;
  siteTitle: any;

  // -------- start scroll code
  scrolled = false;

  @HostListener('window:scroll', [])
  onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    this.scrolled = y > 50;
  }

  // -------- end scroll code

  categoriesByDest: Record<string, any[]> = {};

  ngOnInit(): void {
    this.getDestination();
    this.getSettings();
    this.getCategories();
    this.getEgyptCategory();
    this.applyLanguageSettings();
  }

  isEgypt(dest: any) {
    return dest?.title?.trim().toLowerCase() === 'egypt';
  }

  onLangChange(event: Event): void {
    const langCode = (event.target as HTMLSelectElement).value;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', langCode);
      this.translate.use(langCode);

      const htmlTag = document.documentElement;
      htmlTag.setAttribute('lang', langCode);
      htmlTag.setAttribute('dir', 'ltr'); // Both English and Spanish are LTR

      // Update select value
      const select = document.getElementById('language') as HTMLSelectElement;
      if (select) select.value = langCode;
    }
  }

  applyLanguageSettings(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const langCode = localStorage.getItem('language') || 'en';
    const dir = langCode === 'ar' ? 'rtl' : 'ltr';

    document.documentElement.setAttribute('lang', langCode);
    document.documentElement.setAttribute('dir', dir);

    const select = document.getElementById('language') as HTMLSelectElement;
    if (select) select.value = langCode;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    document.body.style.overflow = '';
  }

  getDestination() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        console.log(res.data.data);
        this.allDestinations = res.data.data;
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getCategories() {
    this._DataService.getCategories().subscribe({
      next: (res) => {
        console.log(res.data.data);
        this.allCategories = res.data.data;
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        console.log(res.data);

        const contactLogo = res.data.find(
          (item: any) => item.option_key === 'logo'
        );
        const logoPath = contactLogo?.option_value[0];
        // Ensure logo URL is complete (add base URL if needed)
        this.logo = logoPath ? this._DataService.getImageUrl(logoPath) : null;

        const contactPhone = res.data.find(
          (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
        );
        this.phoneNunmber = contactPhone?.option_value[0];

        const title = res.data.find(
          (item: any) => item.option_key === 'site_title'
        );
        this.siteTitle = title?.option_value[0];

        // console.log(this.logo);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getEgyptCategory(): void {
    this._DataService.getTours({ destination_title: 'egypt' }).subscribe({
      next: (res) => {
        console.log(res.data.categories);
        this.egyptCategories = res.data.categories;
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  isLoggedIn(): boolean {
    return this._AuthService.isLoggedIn();
  }

  logout(): void {
    this._AuthService.logout();
    this._Router.navigate(['/']);
  }

  /** Tour listing route only (`/tour`), not `/tour/:slug`. */
  private isTourListingTree(tree: UrlTree): boolean {
    const segs = tree.root.children['primary']?.segments ?? [];
    return segs.length === 1 && segs[0].path === 'tour';
  }

  /** Active only on tour listing with `destination=global` (exactly that query, no other keys). */
  isGlobalToursActive(): boolean {
    const tree = this._Router.parseUrl(this._Router.url);
    if (!this.isTourListingTree(tree)) {
      return false;
    }
    const q = tree.queryParams;
    const keys = Object.keys(q);
    return (
      keys.length === 1 &&
      String(q['destination'] ?? '').toLowerCase() === 'global'
    );
  }

  /** Active on tour listing when not viewing global tours. */
  isEgyptToursActive(): boolean {
    const tree = this._Router.parseUrl(this._Router.url);
    if (!this.isTourListingTree(tree)) {
      return false;
    }
    const dest = tree.queryParams['destination'];
    return !(dest != null && String(dest).toLowerCase() === 'global');
  }
}
