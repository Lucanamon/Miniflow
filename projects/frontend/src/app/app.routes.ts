import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/sky',
    pathMatch: 'full'
  },
  {
    path: 'sky',
    loadComponent: () => import('./features/sky/sky.component').then(m => m.SkyComponent)
  },
  {
    path: 'constellations',
    loadComponent: () => import('./features/constellations/constellations.component').then(m => m.ConstellationsComponent)
  },
  {
    path: 'today',
    loadComponent: () => import('./features/today/today.component').then(m => m.TodayComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  }
];
