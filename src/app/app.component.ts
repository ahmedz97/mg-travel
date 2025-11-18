import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent, NgxSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'tricia';

  constructor(
    public translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
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
    }
  }
}
