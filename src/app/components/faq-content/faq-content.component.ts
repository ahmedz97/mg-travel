import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import {
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { DataService } from '../../core/services/data.service';
@Component({
  selector: 'app-faq-content',
  standalone: true,
  imports: [MatExpansionModule, CommonModule],
  templateUrl: './faq-content.component.html',
  styleUrl: './faq-content.component.scss',
})
export class FaqContentComponent implements OnInit, AfterViewInit {
  constructor(private _DataService: DataService) {}
  panelOpenState = false;
  faqs: any[] = [];

  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;

  ngOnInit(): void {
    this.getFAQ();
  }

  ngAfterViewInit(): void {
    // فتح أول عنصر بعد ما يتم تحميل الـ panels
    setTimeout(() => {
      this.openPanel(0);
    });
  }

  openPanel(index: number) {
    this.panels.forEach((panel, i) => {
      panel.expanded = i === index;
    });
  }
  getFAQ() {
    this._DataService.getFAQs().subscribe({
      next: (res) => {
        // console.log(res.data.data);
        this.faqs = res.data.data;
      },
    });
  }
}
