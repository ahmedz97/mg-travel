import { Component } from '@angular/core';
import { NgxCountAnimationDirective } from 'ngx-count-animation';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-aboutsection',
  standalone: true,
  imports: [NgxCountAnimationDirective, RouterLink, TranslateModule],
  templateUrl: './aboutsection.component.html',
  styleUrl: './aboutsection.component.scss',
})
export class AboutsectionComponent {}
