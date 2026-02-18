import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ConstellationMapComponent } from '../../shared/components/constellation-map/constellation-map.component';
import { EncouragementBannerComponent } from '../../shared/components/encouragement-banner/encouragement-banner.component';
import { ProgressMiniChartComponent } from '../../shared/components/progress-mini-chart/progress-mini-chart.component';
import { RecentActivityCardComponent } from '../../shared/components/recent-activity-card/recent-activity-card.component';
import { StorageService } from '../../core/services/storage.service';
import { FormsModule } from '@angular/forms';

const STORAGE_KEY_TASKS = 'miniflow_tasks';

interface Task {
  id: number;
  title: string;
  board: string;
  dueTime?: string;
  completed: boolean;
}

@Component({
  selector: 'app-sky',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    ConstellationMapComponent,
    EncouragementBannerComponent,
    ProgressMiniChartComponent,
    RecentActivityCardComponent,
    FormsModule
  ],
  templateUrl: './sky.component.html',
  styleUrl: './sky.component.scss'
})
export class SkyComponent {
  private router = inject(Router);
  private storage = inject(StorageService);

  quickTaskTitle = signal('');
  showDateTimePicker = signal(false);
  taskDraftDate = signal('');
  taskDraftTime = signal('');

  // Mock stats - replace with real data later
  tasksCompletedToday = signal(3);
  tasksInProgress = signal(5);
  totalBoards = signal(2);

  goToToday(): void {
    this.router.navigateByUrl('/today');
  }

  openAddTaskPicker(): void {
    const title = this.quickTaskTitle().trim();
    if (!title) return;
    const now = new Date();
    this.taskDraftDate.set(now.toISOString().slice(0, 10));
    this.taskDraftTime.set(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
    this.showDateTimePicker.set(true);
  }

  closeDateTimePicker(): void {
    this.showDateTimePicker.set(false);
    this.quickTaskTitle.set('');
  }

  confirmAddTask(): void {
    const title = this.quickTaskTitle().trim();
    if (!title) {
      this.closeDateTimePicker();
      return;
    }
    const dateStr = this.taskDraftDate();
    const timeStr = this.taskDraftTime();
    const dueTime = this.formatDueTime(dateStr, timeStr);

    const existing = this.storage.get<Task[]>(STORAGE_KEY_TASKS) ?? [];
    const maxId = existing.length ? Math.max(...existing.map(t => t.id)) : 0;
    const newTask: Task = {
      id: maxId + 1,
      title,
      board: 'Today',
      dueTime,
      completed: false
    };
    this.storage.set(STORAGE_KEY_TASKS, [...existing, newTask]);
    this.closeDateTimePicker();
  }

  private formatDueTime(dateStr: string, timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date(dateStr);
    d.setHours(hours, minutes, 0, 0);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    if (isToday) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const h = hours % 12 || 12;
      return `${h}:${String(minutes).padStart(2, '0')} ${period}`;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mon = months[d.getMonth()];
    const day = d.getDate();
    const period = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${mon} ${day}, ${h}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  createQuickTask(): void {
    this.openAddTaskPicker();
  }
}
