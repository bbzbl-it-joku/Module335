import { Injectable } from '@angular/core';
import { AlertController, AlertInput } from '@ionic/angular/standalone';

type AlertInputTypes = 'text' | 'textarea' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'checkbox' | 'radio';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private alertController: AlertController) {}

  async presentAlert({
    header = '',
    subHeader = '',
    message = '',
    buttons = ['OK']
  }) {
    const alert = await this.alertController.create({
      header,
      subHeader,
      message,
      buttons,
      cssClass: 'custom-alert'
    });

    await alert.present();
    return alert;
  }

  async presentConfirm({
    header = 'Confirm',
    message = 'Are you sure?',
    confirmButton = 'Confirm',
    cancelButton = 'Cancel',
    confirmColor = 'primary',
    cancelColor = 'medium'
  }) {
    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          {
            text: cancelButton,
            role: 'cancel',
            cssClass: `ion-color-${cancelColor}`,
            handler: () => resolve(false)
          },
          {
            text: confirmButton,
            cssClass: `ion-color-${confirmColor}`,
            handler: () => resolve(true)
          }
        ],
        cssClass: 'custom-alert'
      });

      await alert.present();
    });
  }

  async presentPrompt({
    header = 'Enter Information',
    message = '',
    placeholder = '',
    confirmButton = 'OK',
    cancelButton = 'Cancel',
    inputType = 'text' as AlertInputTypes,
    defaultValue = ''
  }) {
    return new Promise<string | null>(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        inputs: [
          {
            name: 'input',
            type: inputType,
            placeholder,
            value: defaultValue
          }
        ],
        buttons: [
          {
            text: cancelButton,
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: confirmButton,
            handler: (data) => resolve(data.input)
          }
        ],
        cssClass: 'custom-alert'
      });

      await alert.present();
    });
  }

  async dismissAllAlerts() {
    try {
      const alert = await this.alertController.getTop();
      if (alert) {
        await this.alertController.dismiss();
      }
    } catch (error) {
      console.error('Error dismissing alerts:', error);
    }
  }
}
