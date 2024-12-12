import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Notification } from './notification.type';
import {
  ActionPerformed as LocalActionPerformed,
  LocalNotifications,
  LocalNotificationSchema,
  ScheduleOptions
} from '@capacitor/local-notifications';
import { filter } from 'rxjs/operators';
import { User } from '../../models';
import { AuthStateService, ToastService, UserProfileService } from '../index';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification-type.enum';

@Injectable({
  providedIn: 'root'
})
export class DeviceNotificationService {
  private hasPermission = false;
  private currentUser: any | null = null;
  private pendingNotificationIds: number[] = [];
  private readonly isNativePlatform: boolean;

  constructor(
    private authStateService: AuthStateService,
    private userProfileService: UserProfileService,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {
    this.isNativePlatform = Capacitor.isNativePlatform();

    // Keep track of current user and their preferences
    this.authStateService.getCurrentUser().pipe(
      filter(user => user !== null)
    ).subscribe(user => {
      this.currentUser = user;
      this.handleUserPreferencesChange();
    });
  }

  private async handleUserPreferencesChange() {
    if (!this.currentUser) return;

    if (this.currentUser.pushNotifications) {
      await this.initializeNotifications();
    } else {
      await this.removeNotifications();
    }
  }

  async initializeNotifications() {
    // Check if we're on a native platform and notifications are enabled
    if (!this.isNativePlatform || !this.currentUser?.pushNotifications) {
      console.log('Notifications not supported on this platform or disabled');
      return;
    }

    try {
      // Request and check permissions
      const permissionResult = await LocalNotifications.requestPermissions();
      this.hasPermission = permissionResult.display === 'granted';

      if (!this.hasPermission) {
        console.log('Notification permissions not granted - updating preferences');
        await this.updateUserPreferences(false);
        return;
      }

      // Set up local notification listeners
      await this.setupLocalNotificationListeners();

    } catch (error) {
      console.error('Unexpected error initializing notifications:', error);
      await this.toastService.presentToast(
        'Failed to initialize notifications',
        'danger'
      );
    }
  }

  private async setupLocalNotificationListeners() {
    if (!this.isNativePlatform) return;

    // Remove any existing listeners first
    await LocalNotifications.removeAllListeners();

    // Add notification received listener
    LocalNotifications.addListener(
      'localNotificationReceived',
      (notification: LocalNotificationSchema) => {
        this.handleLocalNotification(notification);
      }
    );

    // Add notification action listener
    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (action: LocalActionPerformed) => {
        this.handleLocalNotificationAction(action);
      }
    );
  }

  private async updateUserPreferences(enabled: boolean) {
    if (!this.currentUser) return;

    try {
      await this.userProfileService.update(this.currentUser.id, {
        // push_notifications: enabled,
        // device_token: '' // We're not using device tokens anymore
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  async sendCustomNotification(title: string, body: string) {
    if (!this.isNativePlatform || !this.hasPermission) {
      await this.toastService.presentToast('Notifications unavailable', 'warning');
      return;
    }

    try {
      const notificationId = Math.floor(Math.random() * 100000);
      const notificationOptions: ScheduleOptions = {
        notifications: [{
          id: notificationId,
          title: title,
          body: body,
          schedule: { at: new Date() },
          sound: 'default',
          smallIcon: 'ic_stat_tuka',
          iconColor: '#3880ff'
        }]
      };

      await LocalNotifications.schedule(notificationOptions);
      this.pendingNotificationIds.push(notificationId);

      await this.toastService.presentToast('Notification sent', 'success');
    } catch (error) {
      console.error('Error sending custom notification:', error);
      await this.toastService.presentToast('Failed to send notification', 'danger');
    }
  }

  async checkAndDeliverNotifications() {
    if (!this.isNativePlatform || !this.currentUser?.id || !this.currentUser.pushNotifications || !this.hasPermission) {
      return;
    }

    try {
      const { data: notifications } = await this.notificationService.getUserNotifications(
        this.currentUser.id,
        true
      );

      if (!notifications || notifications.length === 0) return;

      for (const notification of notifications) {
        await this.deliverNotification(notification);
        await this.markNotificationAsRead(notification.id!);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  private async deliverNotification(notification: Notification) {
    if (!this.isNativePlatform) return;

    try {
      const notificationId = Math.floor(Math.random() * 100000);
      const notificationOptions: ScheduleOptions = {
        notifications: [{
          id: notificationId,
          title: this.getNotificationTitle(notification),
          body: this.getNotificationBody(notification),
          schedule: { at: new Date() },
          extra: {
            type: notification.type,
            data: notification.content
          }
        }]
      };

      await LocalNotifications.schedule(notificationOptions);
      this.pendingNotificationIds.push(notificationId);
    } catch (error) {
      console.error('Error delivering notification:', error);
    }
  }

  async removeNotifications() {
    if (!this.isNativePlatform) return;

    try {
      await LocalNotifications.removeAllListeners();

      // Cancel all pending notifications
      if (this.pendingNotificationIds.length > 0) {
        await LocalNotifications.cancel({ notifications: this.pendingNotificationIds.map(id => ({ id })) });
        this.pendingNotificationIds = [];
      }

      if (this.currentUser && this.currentUser.pushNotifications) {
        await this.updateUserPreferences(false);
      }

      this.hasPermission = false;
    } catch (error) {
      console.error('Error removing notifications:', error);
    }
  }

  private async handleLocalNotification(notification: LocalNotificationSchema) {
    if (!this.isNativePlatform || !this.currentUser?.pushNotifications) return;

    await this.toastService.presentToast(
      notification.title || 'New Notification',
      'primary'
    );
  }

  private async handleLocalNotificationAction(action: LocalActionPerformed) {
    if (!this.isNativePlatform || !this.currentUser?.pushNotifications) return;

    const extraData = action.notification.extra;
    await this.handleNotificationAction(extraData);
  }

  private async handleNotificationAction(data: any) {
    if (!this.isNativePlatform || !this.currentUser?.pushNotifications) return;

    switch (data.type) {
      case NotificationType.ReportStatusUpdated:
        await this.toastService.presentToast(
          `Report status updated to: ${data.data.status}`,
          'info'
        );
        break;
      case NotificationType.CommentAdded:
        await this.toastService.presentToast(
          `New comment from ${data.data.username}`,
          'info'
        );
        break;
      case NotificationType.TestNotification:
        await this.toastService.presentToast(
          'Test notification action',
          'info'
        );
        break;
      default:
        console.log('Unhandled notification type:', data.type);
    }
  }

  private async markNotificationAsRead(notificationId: string) {
    try {
      await this.notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  private getNotificationTitle(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.ReportStatusUpdated:
        return 'Report Status Update';
      case NotificationType.CommentAdded:
        return 'New Comment';
      case NotificationType.TestNotification:
        return 'Test Notification';
      default:
        return 'New Notification';
    }
  }

  private getNotificationBody(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.ReportStatusUpdated:
        return `Your report status has been updated to: ${notification.content['status']}`;
      case NotificationType.CommentAdded:
        return `${notification.content['username']} commented on your report`;
      case NotificationType.TestNotification:
        return JSON.stringify(notification.content);
      default:
        return JSON.stringify(notification.content);
    }
  }

  // Public APIs
  isNotificationsEnabled(): boolean {
    return this.isNativePlatform && this.hasPermission && (this.currentUser?.pushNotifications ?? false);
  }

  // New method to send a test notification
  async testNotification() {
    await this.sendCustomNotification(
      'Test Notification',
      'If you see this, notifications are working!'
    );
  }
}
