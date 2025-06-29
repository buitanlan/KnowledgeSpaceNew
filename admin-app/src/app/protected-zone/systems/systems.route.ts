import { Routes } from '@angular/router';
import { authGuard } from '@app/shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
    data: { functionCode: 'SystemUser' },
    canActivate: [authGuard]
  },
  {
    path: 'users/:id/permissions',
    loadComponent: () => import('./users/roles-assign.component').then(m => m.RolesAssignComponent),
    data: { functionCode: 'SystemUser' },
    canActivate: [authGuard]
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent),
    data: { functionCode: 'SystemRole' },
    canActivate: [authGuard]
  },
  {
    path: 'functions',
    loadComponent: () => import('./functions/functions.component').then(m => m.FunctionsComponent),
    data: { functionCode: 'SystemFunction' },
    canActivate: [authGuard]
  },
  {
    path: 'permissions',
    loadComponent: () => import('./permissions/permissions.component').then(m => m.PermissionsComponent),
    data: { functionCode: 'SystemPermission' },
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
]; 