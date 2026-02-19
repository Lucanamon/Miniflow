import { Injectable } from '@angular/core';

/**
 * Service for localStorage operations with type safety and error handling.
 * Provides get, set, remove, and clear methods for persistent storage.
 * Safe for SSR: no-ops when running on the server (uses typeof check to avoid @angular/common).
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private get isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Get a value from localStorage by key.
   * @param key Storage key
   * @returns Parsed value or null if not found or invalid (or when running on server)
   */
  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`StorageService: Error reading key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set a value in localStorage.
   * @param key Storage key
   * @param value Value to store (will be JSON stringified)
   */
  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`StorageService: Error writing key "${key}":`, error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Consider clearing old data.');
      }
    }
  }

  /**
   * Remove a value from localStorage.
   * @param key Storage key to remove
   */
  remove(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`StorageService: Error removing key "${key}":`, error);
    }
  }

  /**
   * Clear all localStorage data.
   * Use with caution!
   */
  clear(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('StorageService: Error clearing storage:', error);
    }
  }
}
