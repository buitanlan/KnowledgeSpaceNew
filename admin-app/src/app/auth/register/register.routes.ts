import { Routes } from '@angular/router';
console.log('📦 Register route loaded');

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./register.component').then((m) => m.RegisterComponent)
  }
];
