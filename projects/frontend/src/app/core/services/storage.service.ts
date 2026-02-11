import { Injectable } from '@angular/core';

/**
 * Service for localStorage operations with type safety and error handling.
 * Provides get, set, remove, and clear methods for persistent storage.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Get a value from localStorage by key.
   * @param key Storage key
   * @returns Parsed value or null if not found or invalid
   */
  get<T>(key: string): T | null {
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
    try {
      localStorage.clear();
    } catch (error) {
      console.error('StorageService: Error clearing storage:', error);
    }
  }
}
