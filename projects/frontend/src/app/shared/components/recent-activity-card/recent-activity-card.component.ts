import { Component, inject } from '@angular/core';
import { MockDataService, ActivityType } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-recent-activity-card',
  standalone: true,
  imports: [],
  templateUrl: './recent-activity-card.component.html',
  styleUrl: './recent-activity-card.component.scss'
})
export class RecentActivityCardComponent {
  private mockData = inject(MockDataService);

  activity = this.mockData.recentActivity;

  getEventLabel(type: ActivityType): string {
    switch (type) {
      case 'completed': return 'Completed';
      case 'created': return 'Created';
      case 'board_updated': return 'Board updated';
      default: return type;
    }
  }

  getEventIcon(type: ActivityType): string {
    switch (type) {
      case 'completed': return '⭐';
      case 'created': return '⭐';
      case 'board_updated': return '⭐';
      default: return '•';
    }
  }
}
