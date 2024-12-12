import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report-details',
  templateUrl: './report-details.page.html',
  styleUrls: ['./report-details.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ReportDetailsPage implements OnInit {
  report_id?: string;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.report_id = this.route.snapshot.paramMap.get('report_id')!;
  }

}
