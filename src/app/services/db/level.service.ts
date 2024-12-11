import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ActionPoints, LevelProgress } from 'src/app/models';
import { AuthStateService, ToastService, UserProfileService } from 'src/app/services';

@Injectable({
  providedIn: 'root'
})
export class LevelService {
  private readonly scalingFactor = 1.15;
  private readonly MIN_LEVEL = 1;
  private levelProgress = new BehaviorSubject<LevelProgress | null>(null);
  private userSubscription: Subscription;

  constructor(
    private userProfileService: UserProfileService,
    private authStateService: AuthStateService,
    private toastService: ToastService
  ) {
    // Initialize level progress tracking
    this.userSubscription = this.authStateService.getCurrentUser().subscribe(user => {
      if (user) {
        this.initializeLevelProgress(user.id);
      } else {
        this.levelProgress.next(null);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private async initializeLevelProgress(userId: string): Promise<void> {
    try {
      const { data: profile } = await this.userProfileService.getById(userId);
      if (profile) {
        await this.updateProgress(userId, profile.total_points);
      }
    } catch (error) {
      console.error('Error initializing level progress:', error);
      this.levelProgress.next(null);
    }
  }

  /**
   * Calculate required points for a specific level
   */
  private getRequiredPoints(level: number): number {
    return Math.floor(30 * Math.pow(this.scalingFactor, level - 1));
  }

  /**
   * Calculate level from total points, ensuring minimum level is 1
   */
  private getLevelFromPoints(totalXP: number): number {
    if (totalXP <= 0) return this.MIN_LEVEL;

    let level = 1;
    while (this.getRequiredPoints(level) <= totalXP) {
      level++;
    }
    return Math.max(this.MIN_LEVEL, level - 1);
  }

  /**
   * Get remaining points needed for next level
   */
  private getPointsToNextLevel(totalXP: number): number {
    const nextLevel = this.getLevelFromPoints(totalXP) + 1;
    return Math.max(0, this.getRequiredPoints(nextLevel) - totalXP);
  }

  /**
   * Calculate total points difference between current level and next level
   */
  private getLevelDifference(totalXP: number): number {
    const currentLevel = this.getLevelFromPoints(totalXP);
    const nextLevel = currentLevel + 1;
    return this.getRequiredPoints(nextLevel) - this.getRequiredPoints(currentLevel);
  }

  /**
   * Calculate progress percentage to next level
   */
  private calculateProgressPercentage(totalXP: number): number {
    if (totalXP <= 0) return 0;

    const currentLevel = this.getLevelFromPoints(totalXP);
    const currentLevelPoints = this.getRequiredPoints(currentLevel);
    const nextLevelPoints = this.getRequiredPoints(currentLevel + 1);
    const progress = (totalXP - currentLevelPoints) / (nextLevelPoints - currentLevelPoints);
    return Math.min(Math.max(progress * 100, 0), 100);
  }

  /**
   * Get current level progress
   */
  getLevelProgress(): Observable<LevelProgress | null> {
    return this.levelProgress.asObservable();
  }

  /**
   * Manually refresh level progress for current user
   */
  async refreshProgress(): Promise<void> {
    const user = await this.authStateService.getCurrentUser().pipe().toPromise();
    if (user) {
      await this.initializeLevelProgress(user.id);
    }
  }

  /**
   * Update user's level progress
   */
  async updateProgress(userId: string, totalPoints: number): Promise<void> {
    const sanitizedPoints = Math.max(0, totalPoints);
    const newLevel = this.getLevelFromPoints(sanitizedPoints);
    const progress: LevelProgress = {
      currentLevel: newLevel,
      currentPoints: sanitizedPoints,
      pointsToNextLevel: this.getPointsToNextLevel(sanitizedPoints),
      progressPercentage: this.calculateProgressPercentage(sanitizedPoints),
      totalPointsRequired: this.getRequiredPoints(newLevel + 1)
    };

    this.levelProgress.next(progress);

    // Update user profile with new level if needed
    const { data: profile } = await this.userProfileService.getById(userId);
    if (profile && this.getLevelFromPoints(profile.total_points) !== newLevel) {
      await this.userProfileService.update(userId, {
        total_points: sanitizedPoints
      });

      this.toastService.presentToast(
        `Congratulations! You've reached Karen Level ${newLevel}!`,
        'success'
      );
    }
  }

  /**
   * Award points for an action and notify subscribers
   */
  async awardPoints(userId: string, action: keyof typeof ActionPoints): Promise<void> {
    const { data: profile } = await this.userProfileService.getById(userId);
    if (!profile) return;

    const pointsToAward = ActionPoints[action];
    const newTotal = Math.max(0, profile.total_points + pointsToAward);

    await this.updateProgress(userId, newTotal);

    // Immediately update the progress for real-time feedback
    const progress: LevelProgress = {
      currentLevel: this.getLevelFromPoints(newTotal),
      currentPoints: newTotal,
      pointsToNextLevel: this.getPointsToNextLevel(newTotal),
      progressPercentage: this.calculateProgressPercentage(newTotal),
      totalPointsRequired: this.getRequiredPoints(this.getLevelFromPoints(newTotal) + 1)
    };

    this.levelProgress.next(progress);
  }

  /**
   * Get points needed for a specific level
   */
  getPointsForLevel(targetLevel: number): number {
    return this.getRequiredPoints(Math.max(this.MIN_LEVEL, targetLevel));
  }

  /**
   * Calculate remaining points to target level
   */
  getPointsToTargetLevel(currentPoints: number, targetLevel: number): number {
    const sanitizedPoints = Math.max(0, currentPoints);
    const sanitizedLevel = Math.max(this.MIN_LEVEL, targetLevel);
    const targetPoints = this.getRequiredPoints(sanitizedLevel);
    return Math.max(0, targetPoints - sanitizedPoints);
  }

  /**
   * Get all level thresholds up to a specific level
   */
  getLevelThresholds(maxLevel: number): Array<{ level: number; points: number }> {
    const sanitizedMaxLevel = Math.max(this.MIN_LEVEL, maxLevel);
    return Array.from({ length: sanitizedMaxLevel }, (_, i) => ({
      level: i + 1,
      points: this.getRequiredPoints(i + 1)
    }));
  }

  /**
   * Check if user can level up
   */
  canLevelUp(currentPoints: number, currentLevel: number): boolean {
    const sanitizedPoints = Math.max(0, currentPoints);
    const sanitizedLevel = Math.max(this.MIN_LEVEL, currentLevel);
    return sanitizedPoints >= this.getRequiredPoints(sanitizedLevel + 1);
  }
}
