import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonInput, IonButton, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonText, IonCol, IonRow, IonGrid, IonBadge, IonNote, IonAvatar } from '@ionic/angular/standalone';
import { Report } from 'src/app/models';
import { AuthService, CategoryService, ReportService } from 'src/app/services';
import * as allIcons from 'ionicons/icons';
import { addIcons } from 'ionicons';
import * as jdenticon from 'jdenticon';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  standalone: true,
  imports: [AsyncPipe, IonAvatar, IonNote, IonBadge, IonGrid, IonRow, IonCol, NgIf, NgFor, IonLabel, IonItem, IonList, IonIcon, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonText]
})
export class ReportListComponent implements OnInit {
  reports: Report[] = [];
  userAvatars: { [key: string]: SafeHtml } = {};

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    addIcons(allIcons);
  }

  async ngOnInit() {
    this.reportService.getAll().then(async reports => {
      this.reports = reports.data as Report[];
      // Generate avatars for all users
      for (const report of this.reports) {
        const username = await this.getUsernameById(report.userId);
        this.generateAvatar(report.userId, username!);
      }
    });
  }

  async getUsernameById(userId: string) {
    return await this.authService.getUsernameById(userId);
  }

  generateAvatar(userId: string, username: string) {
    const svg = jdenticon.toSvg(username, 95);
    this.userAvatars[userId] = this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getUserAvatar(userId: string): SafeHtml {
    return this.userAvatars[userId] || '';
  }
}
