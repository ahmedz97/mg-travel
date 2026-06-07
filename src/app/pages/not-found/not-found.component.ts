import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit {
  constructor(private _SeoService: SeoService) {}

  ngOnInit(): void {
    this._SeoService.applySettingsSeo({
      title: 'Page Not Found - MG Travel',
      description: 'The page you are looking for could not be found on MG Travel.',
      image: '/assets/image/logo-MG-Travel.webp',
      robots: 'noindex, nofollow',
    });
  }
}
