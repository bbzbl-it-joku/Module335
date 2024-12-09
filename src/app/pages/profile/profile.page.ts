// profile.page.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonButtons,
  IonLabel,
  IonItem,
  IonToggle,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonTabBar,
  IonTabButton,
  IonAvatar
} from '@ionic/angular/standalone';
import { logOutOutline, homeOutline, mapOutline, trophyOutline, personOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AlertService } from 'src/app/services/util/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/data/user';
import * as jdenticon from 'jdenticon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonItem,
    IonToggle,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonAvatar
  ]
})
export class ProfilePage implements OnInit, AfterViewInit {
  user: User | null = null;
  avatarSvg: SafeHtml = '';

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    addIcons({
      logOutOutline,
      homeOutline,
      mapOutline,
      trophyOutline,
      personOutline
    });
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (user?.email) {
        const svg = jdenticon.toSvg(user.email, 100);
        this.avatarSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
      }
    });
  }

  ngAfterViewInit() {
    // Refresh jdenticon after view init
    if (this.user?.email) {
      const svg = jdenticon.toSvg(this.user.email, 100);
      this.avatarSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
    }
  }

  async togglePushNotifications() {
    try {
      await this.authService.togglePushNotifications();
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  }

  async editProfile() {
    // Implement edit profile logic
  }

  async changePassword() {
    // Implement change password logic
  }

  logout() {
    this.alertService.presentConfirm({
      header: 'Logout',
      message: 'Are you sure you want to logout?'
    }).then(async (confirmed) => {
      if (confirmed) {
        await this.authService.signOut();
      }
    });
  }
}
