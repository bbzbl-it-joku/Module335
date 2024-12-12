import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, documentTextOutline, logInOutline, mapOutline, medalOutline, statsChartOutline, trophyOutline } from 'ionicons/icons';
import { Report, User } from 'src/app/models';
import { AuthStateService, ReportService } from 'src/app/services';
import { ReportDialogComponent } from "../../../components/report-dialog/report-dialog.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [NgIf, IonCardSubtitle, IonCardContent, IonList, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonItem, IonText, IonButton, IonLabel, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, ReportDialogComponent],
})
export class DashboardPage implements OnInit {
  user: User | null = null;
  userReports: Report[] = [];
  allReports: Report[] = [];
  page = 1;

  constructor(
    private authStateService: AuthStateService,
    private reportService: ReportService
  ) {
    addIcons({ trophyOutline, statsChartOutline, chevronForwardOutline, mapOutline, logInOutline, documentTextOutline });
  }

  ngOnInit() {
    this.authStateService.getCurrentUser().subscribe((user) => {
      this.user = user;
    });
  }

  private async loadUserReports() {
    if (!this.user?.id) return;

    const { data: reports } = await this.reportService.getByUserId(this.user.id);
    if (reports) {
      this.userReports = reports;
    }
  }

  private async loadReports() {
    const { data: reports } = await this.reportService.getPaged(this.page, 5);
    if (reports) {
      this.allReports = reports;
    }
  }

  async loadMoreReports() {
    this.page++;
    await this.loadReports();
  }

}
