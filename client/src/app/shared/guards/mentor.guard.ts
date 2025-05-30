import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const mentorGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  return auth.checkRole().pipe(
    map(role => role === 'mentor'
      ? true
      : router.parseUrl('/')
    ),
    catchError(() => of(router.parseUrl('/login')))
  );
};