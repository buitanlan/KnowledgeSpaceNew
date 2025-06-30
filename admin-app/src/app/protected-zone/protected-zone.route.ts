import { Routes } from '@angular/router';
import { authGuard } from '@app/shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./protected-zone.component').then((m) => m.ProtectedZoneComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: { functionCode: 'Dashboard' },
        canActivate: [authGuard]
      },
      {
        path: 'systems',
        loadChildren: () => import('./systems/systems.route').then((m) => m.routes),
        data: { functionCode: 'SystemManagement' },
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
