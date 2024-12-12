import { Routes } from '@angular/router';
import { TabsPage } from 'src/app/pages/tabs/tabs.page';
import { AuthGuard } from 'src/app/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./reports/reports.page').then((m) => m.ReportsPage),
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./rankings/rankings.page').then((m) => m.RankingsPage),
        canActivate: [AuthGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.page').then((m) => m.ProfilePage),
        canActivate: [AuthGuard],
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
