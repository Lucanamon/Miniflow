import { Component, inject } from '@angular/core';
import { ActivityService, ActivityType } from '../../../core/services/activity.service';

@Component({
  selector: 'app-recent-activity-card',
  standalone: true,
  imports: [],
  templateUrl: './recent-activity-card.component.html',
  styleUrl: './recent-activity-card.component.scss'
})
export class RecentActivityCardComponent {
  private activityService = inject(ActivityService);

  // Per-user activities from the service
  activity = this.activityService.activities;

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

