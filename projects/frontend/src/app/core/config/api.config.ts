import { InjectionToken } from '@angular/core';

/** Base URL for the Miniflow backend API (e.g. http://localhost:63468) */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:63468',
});
