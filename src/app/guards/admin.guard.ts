import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserRole } from '../models/enums/user-role.enum';
import { AuthStateService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authStateService: AuthStateService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authStateService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (user?.role === UserRole.Admin) {
          return true;
        }
        return this.router.createUrlTree(['/']);
      })
    );
  }
}
