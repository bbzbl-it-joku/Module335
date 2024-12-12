import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from 'src/app/services';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user) {
          // Not authenticated, allow access
          return true;
        } else {
          // Already authenticated, redirect to home
          return this.router.createUrlTree(['/tabs']);
        }
      })
    );
  }
}
