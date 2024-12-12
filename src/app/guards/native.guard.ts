import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class NativeGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    if (Capacitor.isNativePlatform()) {
      return true;
    } else {
      this.router.navigate(['/tabs']);
      return false;
    }
  }
}
