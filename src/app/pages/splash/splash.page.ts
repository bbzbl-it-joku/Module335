import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class SplashPage implements OnInit {
  constructor(
    private router: Router,
  ) {

    addIcons({ alertCircleOutline });
  }

  ngOnInit() {
    this.initializeApp();
  }

  private async initializeApp() {
    try {
      // Wait for animation duration
      await this.delay(3000);

      await this.router.navigate(['/tabs']);
    } catch (error) {
      console.error('Error initializing app:', error);
      await this.router.navigate(['/tabs']);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
