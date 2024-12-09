import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastController: ToastController;

  constructor() {
    this.toastController = new ToastController();
  }

  async presentToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 5000,
      position: 'top',
      swipeGesture: 'vertical',
      
    });
    toast.present();
  }
}
