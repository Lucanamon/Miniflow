import { Component, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EncouragementBannerComponent } from '../../shared/components/encouragement-banner/encouragement-banner.component';
import { ProgressMiniChartComponent } from '../../shared/components/progress-mini-chart/progress-mini-chart.component';
import { RecentActivityCardComponent } from '../../shared/components/recent-activity-card/recent-activity-card.component';
import { ReflectionPreviewCardComponent } from '../../shared/components/reflection-preview-card/reflection-preview-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sky',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    EncouragementBannerComponent,
    ProgressMiniChartComponent,
    RecentActivityCardComponent,
    ReflectionPreviewCardComponent,
    FormsModule
  ],
  templateUrl: './sky.component.html',
  styleUrl: './sky.component.scss'
})
export class SkyComponent {
  quickTaskTitle = signal('');

  // Mock stats - replace with real data later
  tasksCompletedToday = signal(3);
  tasksInProgress = signal(5);
  totalBoards = signal(2);
  currentStreak = signal(7);

  createQuickTask() {
    if (this.quickTaskTitle().trim()) {
      // TODO: Implement task creation
      console.log('Creating task:', this.quickTaskTitle());
      this.quickTaskTitle.set('');
      // Show success feedback
    }
  }
}
