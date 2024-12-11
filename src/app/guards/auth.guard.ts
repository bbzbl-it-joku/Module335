import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, take, switchMap, catchError } from 'rxjs/operators';
import { AuthService, AuthStateService, UserProfileService } from 'src/app/services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private authStateService: AuthStateService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  private handleAuth(): Observable<boolean | UrlTree> {
    return from(this.authService.getSession()).pipe(
      switchMap(({ data: { session }, error }) => {
        if (error) {
          console.error('Session check error:', error);
          return of(this.router.createUrlTree(['/login']));
        }

        if (session?.user) {
          return from(this.userProfileService.loadProfile(session.user.id)).pipe(
            map(() => true),
            catchError(() => of(this.router.createUrlTree(['/login'])))
          );
        }

        return this.authStateService.getCurrentUser().pipe(
          take(1),
          map(user => user ? true : this.router.createUrlTree(['/login']))
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
