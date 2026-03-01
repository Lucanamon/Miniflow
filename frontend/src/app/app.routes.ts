import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/sky',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
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
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'focus',
    loadComponent: () => import('./features/focus/focus.component').then(m => m.FocusComponent)
  }
];
