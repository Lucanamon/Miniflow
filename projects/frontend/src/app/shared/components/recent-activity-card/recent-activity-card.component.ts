import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivityService, ActivityType } from '../../../core/services/activity.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-recent-activity-card',
  standalone: true,
  imports: [],
  templateUrl: './recent-activity-card.component.html',
  styleUrl: './recent-activity-card.component.scss'
})
export class RecentActivityCardComponent implements OnInit, OnDestroy {
  private activityService = inject(ActivityService);
  private storage = inject(StorageService);
  private storageListener?: () => void;

  // Get activities from the service signal
  activity = this.activityService.activities;

  ngOnInit(): void {
    // Listen for storage changes to update activities in real-time
    if (typeof window !== 'undefined') {
      this.storageListener = () => {
        // Reload activities when storage changes (from other tabs/components)
        const stored = this.storage.get<Array<{ id: string; type: ActivityType; title: string; timestamp: string }>>('miniflow_activities');
        if (stored) {
          const activities = stored
            .map(a => ({
              ...a,
              timestamp: new Date(a.timestamp)
            }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5);
          this.activityService.activities.set(activities);
        }
      };
      window.addEventListener('storage', this.storageListener);
    }
  }

  ngOnDestroy(): void {
    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
    }
  }

  getEventLabel(type: ActivityType): string {
    switch (type) {
      case 'completed': return 'Completed';
      case 'created': return 'Created';
      case 'board_updated': return 'Board updated';
      case 'deleted': return 'Deleted';
      default: return type;
    }
  }

  getEventIcon(type: ActivityType): string {
    switch (type) {
      case 'completed': return '⭐';
      case 'created': return '✨';
      case 'board_updated': return '📋';
      case 'deleted': return '🗑️';
      default: return '•';
    }
  }
}

