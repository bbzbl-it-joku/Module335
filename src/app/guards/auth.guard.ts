import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private handleAuth(): Observable<boolean | UrlTree> {
    // Convert the Promise to an Observable using 'from'
    return from(this.authService.getSession()).pipe(
      switchMap(({ data: { session } }) => {
        if (session?.user) {
          return of(true);
        }
        return this.authService.getCurrentUser().pipe(
          take(1),
          map(user => {
            if (user) {
              return true;
            }
            return this.router.createUrlTree(['/login']);
          })
        );
      })
    );
  }

  canActivate(): Observable<boolean | UrlTree> {
    return this.handleAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.canActivate();
  }
}
