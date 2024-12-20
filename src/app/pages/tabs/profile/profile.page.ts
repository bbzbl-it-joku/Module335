import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader,
  IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem,
  IonItemDivider, IonItemGroup, IonLabel, IonList, IonNote, IonProgressBar,
  IonTitle, IonToggle, IonToolbar, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline, homeOutline, keyOutline, listOutline,
  logOutOutline, mapOutline,
  moonOutline,
  notificationsOutline, personOutline,
  refreshOutline,
  settingsOutline, trophyOutline
} from 'ionicons/icons';
import * as jdenticon from 'jdenticon';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import { LevelProgress, User } from 'src/app/models';
import {
  AlertService, AuthService, AuthStateService,
  LevelService,
  ToastService
} from 'src/app/services';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonCardTitle, IonItemGroup, IonItemDivider, IonCardHeader,
    IonCardSubtitle, IonList, IonNote, IonItem,
    IonProgressBar, IonCardContent, IonCard, IonLabel, IonAvatar,
    IonButton, IonButtons, IonContent, IonTitle, IonIcon,
    IonToolbar, IonHeader, CommonModule, FormsModule, IonToggle
  ]
})
export class ProfilePage implements OnInit {
  darkMode = true;
  user: User | null = null;
  avatarSvg: SafeHtml = '';
  levelProgress: LevelProgress | null = null;

  constructor(
    private toastService: ToastService,
    private alertService: AlertService,
    private authService: AuthService,
    private authStateService: AuthStateService,
    private themeService: ThemeService,
    private levelService: LevelService,
    private modalController: ModalController,
    private sanitizer: DomSanitizer
  ) {
    addIcons({ logOutOutline, personOutline, moonOutline, settingsOutline, addCircleOutline, notificationsOutline, listOutline, keyOutline, homeOutline, mapOutline, trophyOutline, refreshOutline });
  }

  ngOnInit() {
    // Load user profile
    this.authStateService.getCurrentUser().subscribe(async (user) => {
      if (user) {
        this.user = user;
        if (user.username) {
          const svg = jdenticon.toSvg(user.username, 95);
          this.avatarSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
        }
      }
    });

    // Load level progress
    this.levelService.getLevelProgress().subscribe((progress) => {
      if (progress) {
        this.levelProgress = progress
      }
    });

    this.darkMode = this.themeService.isDarkMode();
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
    await modal.dismiss();
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

  toggleDarkMode(event: CustomEvent) {
    this.darkMode = event.detail.checked;
    this.themeService.setTheme(this.darkMode);
  }
}
