import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar, IonCol, IonRow, IonGrid, IonText, IonCardTitle, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, mapOutline, medalOutline, personOutline, trophyOutline } from 'ionicons/icons';
import { User } from 'src/app/models';
import { AuthService, LevelService, UserProfileService } from 'src/app/services';
import * as jdenticon from 'jdenticon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.page.html',
  styleUrls: ['./rankings.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonCardTitle, IonText, IonGrid, IonRow, IonCol, CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardContent, IonList, IonItem, IonLabel, IonNote, IonBadge, IonIcon, NgFor, NgIf]
})
export class RankingsPage implements OnInit {
  rankings: Partial<User>[] = [];

  constructor(
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private levelService: LevelService,
    private sanitizer: DomSanitizer
  ) {
    addIcons({
      trophyOutline,
      medalOutline,
      homeOutline,
      mapOutline,
      personOutline
    });
  }

  ngOnInit() {
    this.loadRankings();
  }

  private async loadRankings() {
    try {
      const { data: user_profiles } = await this.userProfileService.getRankings();
      if (!user_profiles) {
        this.rankings = [];
        return;
      }

      this.rankings = await Promise.all(
        user_profiles.map(async (profile) => {
          const username = await this.authService.getUsernameById(profile.user_id);
          return {
            id: profile.user_id,  // map user_id to id for User model
            username: username || undefined,  // convert null to undefined to match User model
            totalPoints: profile.total_points,  // map total_points to totalPoints
            pushNotifications: profile.push_notifications,
            role: profile.role,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
          } as Partial<User>;
        })
      );
    } catch (error) {
      console.error('Error loading rankings:', error);
      this.rankings = [];
    }
  }

  getTop3Users() {
    return this.rankings.slice(0, 3);
  }

  getUserRanking(user_id: string): number {
    return this.rankings.findIndex((profile) => profile.id === user_id) + 1;
  }

  getUserLevel(user_points: number): number {
    return this.levelService.getLevelFromPoints(user_points);
  }

  getUserAvatar(username: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(jdenticon.toSvg(username, 20));
  }


  getTrophyColor(rank: number): string {
    switch (rank) {
      case 1: return 'first';
      case 2: return 'second';
      case 3: return 'third';
      default: return 'medium';
    }
  }

  getTrophyIcon(rank: number): string {
    switch (rank) {
      case 1: return 'trophy-outline';
      case 2: return 'medal-outline';
      case 3: return 'medal-outline';
      default: return 'medal-outline';
    }
  }
}
