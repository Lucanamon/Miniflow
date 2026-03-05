import { Injectable, signal } from '@angular/core';

export type ThemeName = 'sky' | 'andromeda';

const STORAGE_KEY = 'miniflow_theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<ThemeName>('sky');

  constructor() {
    const saved = (typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEY)
      : null) as ThemeName | null;

    const initial: ThemeName = saved === 'andromeda' ? 'andromeda' : 'sky';
    this.currentTheme.set(initial);
    this.applyTheme(initial);
  }

  setTheme(theme: ThemeName): void {
    if (this.currentTheme() === theme) return;

    this.currentTheme.set(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeName): void {
    if (typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    body.classList.remove('theme-sky', 'theme-andromeda');
    body.classList.add(theme === 'andromeda' ? 'theme-andromeda' : 'theme-sky');
  }
}

