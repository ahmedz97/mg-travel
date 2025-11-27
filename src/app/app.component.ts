import { Component, OnInit, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { PageLoaderComponent } from './pages/page-loader/page-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavComponent, FooterComponent, NgxSpinnerComponent, PageLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'tricia';
  isInitialLoad = true;
  private routerSubscription?: Subscription;

  constructor(
    public translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    // Set default language
    translate.setDefaultLang('en');
    
    if (isPlatformBrowser(this.platformId)) {
      const langCode = localStorage.getItem('language') || 'en';
      translate.use(langCode);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const langCode = localStorage.getItem('language') || 'en';

      // Apply lang and dir to <html>
      const htmlTag = document.documentElement;
      htmlTag.setAttribute('lang', langCode);
      htmlTag.setAttribute('dir', 'ltr'); // Both English and Spanish are LTR

      // Listen for language changes
      this.translate.onLangChange.subscribe((event) => {
        const currentLang = event.lang;
        htmlTag.setAttribute('lang', currentLang);
        htmlTag.setAttribute('dir', 'ltr'); // Both English and Spanish are LTR
      });

      // Track router navigation for initial load
      // Start with loader visible, hide it after first navigation completes
      this.routerSubscription = this.router.events
        .pipe(
          filter(
            (event) =>
              event instanceof NavigationEnd ||
              event instanceof NavigationCancel ||
              event instanceof NavigationError
          )
        )
        .subscribe((event) => {
          // After first navigation completes, hide loader and show nav/footer
          if (this.isInitialLoad) {
            // Small delay to ensure smooth transition
            setTimeout(() => {
              this.isInitialLoad = false;
            }, 300);
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
