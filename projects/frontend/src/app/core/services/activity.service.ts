import { Injectable, signal, inject } from '@angular/core';
import { StorageService } from './storage.service';

export type ActivityType = 'completed' | 'created' | 'board_updated' | 'deleted';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  timestamp: Date;
}

const STORAGE_KEY_ACTIVITIES = 'miniflow_activities';
const MAX_ACTIVITIES = 10; // Keep last 10 activities

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private storage = inject(StorageService);
  
  // Signal for reactive updates
  readonly activities = signal<ActivityEvent[]>([]);

  constructor() {
    // Load activities from storage on init
    this.activities.set(this.loadActivities());
  }

  /**
   * Load activities from storage
   */
  private loadActivities(): ActivityEvent[] {
    const stored = this.storage.get<Array<Omit<ActivityEvent, 'timestamp'> & { timestamp: string }>>(STORAGE_KEY_ACTIVITIES);
    if (!stored || stored.length === 0) {
      return [];
    }
    // Convert timestamp strings back to Date objects
    return stored
      .map(a => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, MAX_ACTIVITIES);
  }

  /**
   * Save activities to storage
   */
  private saveActivities(activities: ActivityEvent[]): void {
    // Convert Date objects to strings for storage
    const toStore = activities.map(a => ({
      ...a,
      timestamp: a.timestamp.toISOString()
    }));
    this.storage.set(STORAGE_KEY_ACTIVITIES, toStore);
  }

  /**
   * Add a new activity event
   */
  addActivity(type: ActivityType, title: string): void {
    const newActivity: ActivityEvent = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      timestamp: new Date()
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
