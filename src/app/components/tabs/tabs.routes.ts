import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from 'src/app/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../../pages/tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../../pages/tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../../pages/tab3/tab3.page').then((m) => m.Tab3Page),
        canActivate: [AuthGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../../pages/profile/profile.page').then((m) => m.ProfilePage),
        canActivate: [AuthGuard],
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
