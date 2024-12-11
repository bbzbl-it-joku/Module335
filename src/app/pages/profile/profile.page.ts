import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonNote, IonProgressBar, IonTitle, IonToggle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, homeOutline, keyOutline, logOutOutline, mapOutline, notificationsOutline, personOutline, trophyOutline } from 'ionicons/icons';
import * as jdenticon from 'jdenticon';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import { LevelProgress, User } from 'src/app/models';
import { AlertService, AuthService, AuthStateService, LevelService, UserProfileService } from 'src/app/services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonItemGroup, IonItemDivider, IonCardHeader, IonCardSubtitle, IonList, IonNote, IonToggle, IonItem, IonProgressBar, IonCardContent, IonCard, IonLabel, IonAvatar, IonButton, IonButtons, IonContent, IonTitle, IonIcon, IonToolbar, IonHeader, IonLabel, IonButtons, IonButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonToggle, IonCard, IonCardContent, IonProgressBar, IonAvatar]
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  avatarSvg: SafeHtml = '';
  levelProgress: LevelProgress | null = null;

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private authStateService: AuthStateService,
    private userProfileService: UserProfileService,
    private levelService: LevelService,
    private modalController: ModalController,
    private sanitizer: DomSanitizer
  ) {
    addIcons({logOutOutline,personOutline,keyOutline,notificationsOutline,addCircleOutline,homeOutline,mapOutline,trophyOutline});
  }

  ngOnInit() {
    // Load user profile
    this.authStateService.getCurrentUser().subscribe(async (user) => {
      if (user) {
        this.user = user;
        if (user.email) {
          const svg = jdenticon.toSvg(user.email, 100);
          this.avatarSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
        }
      }
    });

    // Load level progress
    this.levelService.getLevelProgress().subscribe((progress) => {
      if (progress) {
        console.log('Level progress:', progress);
        this.levelProgress = progress
      }
    });
  }

  async togglePushNotifications() {
    if (!this.user?.id) return;

    try {
      await this.userProfileService.togglePushNotifications(
        this.user.id,
        this.user.pushNotifications
      );
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  }

  async editProfile() {
    const modal = await this.modalController.create({
      component: EditProfileComponent,
      componentProps: {
        user: this.user
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      this.ngOnInit();
    }
  }

  async changePassword() {
    // Implement change password logic
  }

  async gainXP() {
    if (!this.user?.isAdmin()) return;
    this.levelService.updateProgress(this.user!.id, this.user!.totalPoints + 50);
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
