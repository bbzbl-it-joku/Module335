import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonLabel, IonSegment, IonSegmentButton, IonTitle, IonToolbar, IonButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { listOutline, mapOutline, chevronUpOutline, chevronDownOutline } from 'ionicons/icons';
import { ReportService } from 'src/app/services';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ReportMapComponent } from 'src/app/components/report-map/report-map.component';
import { ReportListComponent } from 'src/app/components/report-list/report-list.component';
import { ReportDialogComponent } from "../../../components/report-dialog/report-dialog.component";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [NgIf, IonButtons, IonButton, IonIcon, IonLabel, IonSegment, IonSegmentButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReportMapComponent, ReportListComponent, ReportDialogComponent],
  animations: [
    trigger('slideInOut', [
      state('true', style({
        maxHeight: '100px',  // adjust this value based on your content
        opacity: 1,
        overflow: 'hidden'
      })),
      state('false', style({
        maxHeight: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      transition('true <=> false', animate('300ms ease-in-out'))
    ]),
    trigger('rotate', [
      state('true', style({ transform: 'rotate(180deg)' })),
      state('false', style({ transform: 'rotate(0deg)' })),
      transition('true <=> false', animate('300ms ease-in-out'))
    ])
  ]
})
export class ReportsPage implements OnInit {
  extended = true;
  mode = 'map' as 'map' | 'list';

  constructor(
    private reportService: ReportService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    addIcons({ chevronUpOutline, chevronDownOutline, mapOutline, listOutline });
  }

  ngOnInit() {
    this.loadExtended();
    // Subscribe to query params to get the mode
    this.route.queryParams.subscribe(params => {
      if (params['mode'] && (params['mode'] === 'map' || params['mode'] === 'list')) {
        this.mode = params['mode'];
      }
    });
  }

  // Update the template to use this method for mode changes
  onModeChange(event: any) {
    const newMode = event.detail.value;
    this.mode = newMode;
    // Update URL without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: newMode },
      queryParamsHandling: 'merge', // keeps other query params
    });
  }

  loadExtended() {
    if (localStorage.getItem('reports-segment-extended') === null) {
      localStorage.setItem('reports-segment-extended', this.extended.toString());
    }
    this.extended = localStorage.getItem('reports-segment-extended') === 'true';
  }

  toggleExtended() {
    this.extended = !this.extended;
    localStorage.setItem('reports-segment-extended', this.extended.toString());
  }
}
