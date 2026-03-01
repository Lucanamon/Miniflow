import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigateByUrl('/login');
    return false;
  }
  if (!auth.isAdmin()) {
    router.navigateByUrl('/sky');
    return false;
  }
  return true;
};
