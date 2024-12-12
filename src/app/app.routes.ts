import { Routes } from '@angular/router';
import { NoAuthGuard } from './guards/no-auth.guard';
import { NativeGuard } from './guards/native.guard';

export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then( m => m.SplashPage),
    canActivate: [NativeGuard],
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup.page').then(m => m.SignupPage),
    canActivate: [NoAuthGuard],
  },

];
