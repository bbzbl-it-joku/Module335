import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonInput, IonButton, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonText } from '@ionic/angular/standalone';
import { Report } from 'src/app/models';
import { CategoryService, ReportService } from 'src/app/services';
import * as allIcons from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  standalone: true,
  imports: [ NgIf, NgFor, IonInput, IonButton, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonText]
})
export class ReportListComponent implements OnInit {
  reports: Report[] = [];

  constructor(
    private reportService: ReportService,
    private categoryService: CategoryService
  ) { }

  async ngOnInit() {
    this.reportService.getAll().then(reports => {
      this.reports = reports.data as Report[];
    });
    await this.loadIcons();
  }

  async loadIcons() {
    const categories = (await this.categoryService.getAll()).data;


    categories?.forEach(category => {
      const iconName = category.iconName;
      if (iconName) {
        const icon = (allIcons as any)[iconName];
        console.log(icon);

        if (icon) {
          addIcons({ icon });
          return;
        }
      }
    });
  }

}
