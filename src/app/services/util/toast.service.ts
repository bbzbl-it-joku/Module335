import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastController: ToastController) { }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 5000,
      position: 'top',
      swipeGesture: 'vertical'
    });

    await toast.present();
  }

  async presentToastWithOptions({
    message = '',
    color = 'success',
    duration = 5000,
  }) {
    const toast = await this.toastController.create({
      message,
      color,
      duration,
      position: 'top',
      swipeGesture: 'vertical'
    });

    await toast.present();
  }

  // Helper method to dismiss all toasts
  async dismissAllToasts() {
    try {
      const toasts = await this.toastController.getTop();
      if (toasts) {
        await this.toastController.dismiss();
      }
    } catch (error) {
      console.error('Error dismissing toasts:', error);
    }
  }
}
