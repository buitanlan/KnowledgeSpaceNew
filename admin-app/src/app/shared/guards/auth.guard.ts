import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';

export const authGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isAuthenticated()) {
    console.log('Auth Guard - Not authenticated, redirecting to login');
    router.navigate(['/login'], {
      queryParams: { redirect: state.url },
      replaceUrl: true
    });
    return false;
  }

  // Check permissions if functionCode is specified
  const functionCode = route.data['functionCode'] as string;

  if (!functionCode) {
    console.log('Auth Guard - No functionCode required, allowing access');
    return true;
  }

  const hasPermission = authService.hasPermission(functionCode, 'View');
  
  if (!hasPermission) {
    console.log(`Auth Guard - No permission for ${functionCode}, redirecting to access denied`);
    router.navigate(['/access-denied'], {
      queryParams: { redirect: state.url }
    });
    return false;
  }

  return true;
};
