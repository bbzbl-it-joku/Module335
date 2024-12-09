import { NgIf } from '@angular/common';
import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square, person, logIn } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, NgIf],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(private authService: AuthService) {
    addIcons({triangle,ellipse,square,person,logIn});
  }
}
