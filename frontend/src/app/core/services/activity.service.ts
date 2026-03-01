import { Injectable, signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

export type ActivityType = 'completed' | 'created' | 'board_updated' | 'deleted';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  timestamp: Date;
}

const STORAGE_KEY_PREFIX = 'miniflow_activities';
const MAX_ACTIVITIES = 10; // Keep last 10 activities

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private api = inject(ApiService);

  // Signal for reactive updates (per-user)
  readonly activities = signal<ActivityEvent[]>([]);

  constructor() {
    this.reloadForCurrentUser();
  }

  /** Per-user storage key so each user only sees their own activity */
  private getStorageKey(): string {
    const userId = this.auth.getUser()?.id ?? 'anonymous';
    return `${STORAGE_KEY_PREFIX}_${userId}`;
  }

  /** Reload activities for the current user (call after login/logout) */
  reloadForCurrentUser(): void {
    if (this.auth.isLoggedIn()) {
      this.api.getActivities(MAX_ACTIVITIES).subscribe({
        next: (list) => {
          const events: ActivityEvent[] = list.map((a) => ({
            id: a.id,
            type: a.type as ActivityType,
            title: a.title,
            timestamp: new Date(a.timestamp),
          }));
          this.activities.set(events);
        },
        error: () => {
          this.activities.set(this.loadActivities());
        },
      });
    } else {
      this.activities.set(this.loadActivities());
    }
  }

  /**
   * Load activities from storage for current user
   */
  private loadActivities(): ActivityEvent[] {
    const key = this.getStorageKey();
    const stored = this.storage.get<Array<Omit<ActivityEvent, 'timestamp'> & { timestamp: string }>>(key);
    if (!stored || stored.length === 0) {
      return [];
    }
    return stored
      .map(a => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, MAX_ACTIVITIES);
  }

  /**
   * Save activities to storage for current user
   */
  private saveActivities(activities: ActivityEvent[]): void {
    const toStore = activities.map(a => ({
      ...a,
      timestamp: a.timestamp.toISOString()
    }));
    this.storage.set(this.getStorageKey(), toStore);
  }

  /**
   * Add a new activity event (persists to backend when logged in, else localStorage)
   */
  addActivity(type: ActivityType, title: string): void {
    if (this.auth.isLoggedIn()) {
      this.api.createActivity({ type, title }).subscribe({
        next: (a) => {
          const newActivity: ActivityEvent = {
            id: a.id,
            type: a.type as ActivityType,
            title: a.title,
            timestamp: new Date(a.timestamp),
          };
          const current = this.activities();
          const updated = [newActivity, ...current]
            .sort((x, y) => y.timestamp.getTime() - x.timestamp.getTime())
            .slice(0, MAX_ACTIVITIES);
          this.activities.set(updated);
        },
        error: () => {
          this.addActivityLocal(type, title);
        },
      });
    } else {
      this.addActivityLocal(type, title);
    }
  }

  private addActivityLocal(type: ActivityType, title: string): void {
    const newActivity: ActivityEvent = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      timestamp: new Date(),
    };
    const current = this.activities();
    const updated = [newActivity, ...current]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, MAX_ACTIVITIES);
    this.activities.set(updated);
    this.saveActivities(updated);
  }

  /**
   * Log task completion
   */
  logTaskCompleted(taskTitle: string): void {
    this.addActivity('completed', taskTitle);
  }

  /**
   * Log task creation
   */
  logTaskCreated(taskTitle: string): void {
    this.addActivity('created', taskTitle);
  }

  /**
   * Log task deletion
   */
  logTaskDeleted(taskTitle: string): void {
    this.addActivity('deleted', taskTitle);
  }

  /**
   * Log board update
   */
  logBoardUpdated(boardName: string): void {
    this.addActivity('board_updated', boardName);
  }

  /**
   * Get recent activities (last N)
   */
  getRecentActivities(count: number = 5): ActivityEvent[] {
    return this.activities().slice(0, count);
  }
}
