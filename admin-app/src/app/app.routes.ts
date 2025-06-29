import { Routes } from '@angular/router';
import { authGuard } from '@app/shared/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.route').then((m) => m.routes)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./protected-zone/protected-zone.route').then((m) => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'systems',
    loadChildren: () => import('./protected-zone/systems/systems.route').then((m) => m.routes),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
