import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, ellipse, home, person, square, trophy } from 'ionicons/icons';
import { AuthService } from 'src/app/services';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    private authService: AuthService, // keep here for initialization
  ) {
    addIcons({ home, documentTextOutline, trophy, person, square, ellipse });
  }
}
