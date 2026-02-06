import { Component, inject, computed } from '@angular/core';
import { MockDataService, DailyProgress } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-progress-mini-chart',
  standalone: true,
  imports: [],
  templateUrl: './progress-mini-chart.component.html',
  styleUrl: './progress-mini-chart.component.scss'
})
export class ProgressMiniChartComponent {
  private mockData = inject(MockDataService);

  progressData = this.mockData.weeklyProgress;
  maxCompleted = computed(() => {
    const data = this.progressData();
    return Math.max(1, ...data.map(d => d.completed));
  });
}
