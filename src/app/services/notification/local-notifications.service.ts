import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ToastService } from '..';

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationService {
  private hasPermission = false;
  private readonly isNativePlatform: boolean;

  constructor(private toastService: ToastService) {
    this.isNativePlatform = Capacitor.isNativePlatform();
    this.initialize();
  }

  private async initialize() {
    if (!this.isNativePlatform) {
      console.log('Not running on native platform');
      return;
    }

    try {
      // Request permissions
      const permResult = await LocalNotifications.requestPermissions();
      console.log('Permission result:', permResult);
      this.hasPermission = permResult.display === 'granted';

      if (this.hasPermission) {
        // Set up listeners
        LocalNotifications.addListener('localNotificationReceived', (notification) => {
          console.log('Notification received:', notification);
        });

        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('Notification action performed:', notification);
        });
      }
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  async sendNotification(title: string, body: string) {
    if (!this.isNativePlatform) {
      console.log('Not running on native platform');
      await this.toastService.presentToast('Notifications only work on native devices', 'warning');
      return;
    }

    try {
      const permResult = await LocalNotifications.checkPermissions();
      console.log('Permission check:', permResult);

      if (permResult.display !== 'granted') {
        const newPermResult = await LocalNotifications.requestPermissions();
        if (newPermResult.display !== 'granted') {
          await this.toastService.presentToast('Notification permission denied', 'danger');
          return;
        }
      }

      const notificationId = Math.floor(Math.random() * 100000);

      await LocalNotifications.schedule({
        notifications: [{
          id: notificationId,
          title: title,
          body: body,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          smallIcon: 'ic_stat_tuka',
          iconColor: '#3880ff'
        }]
      });

      console.log('Notification scheduled:', notificationId);
      await this.toastService.presentToast('Notification sent', 'success');

    } catch (error) {
      console.error('Error sending notification:', error);
      await this.toastService.presentToast('Failed to send notification', 'danger');
    }
  }

  async testNotification() {
    await this.sendNotification(
      'Test Notification',
      'If you see this, notifications are working!'
    );
  }
}
