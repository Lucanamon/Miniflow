import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ConstellationMapComponent } from '../../shared/components/constellation-map/constellation-map.component';
import { EncouragementBannerComponent } from '../../shared/components/encouragement-banner/encouragement-banner.component';
import { ProgressMiniChartComponent } from '../../shared/components/progress-mini-chart/progress-mini-chart.component';
import { RecentActivityCardComponent } from '../../shared/components/recent-activity-card/recent-activity-card.component';
import { StorageService } from '../../core/services/storage.service';
import { ActivityService } from '../../core/services/activity.service';
import { FormsModule } from '@angular/forms';

const STORAGE_KEY_TASKS = 'miniflow_tasks';
const STORAGE_KEY_BOARDS = 'miniflow_boards';

interface Task {
  id: string;
  title: string;
  board: string;
  dueTime?: string;
  completed: boolean;
}

interface Board {
  id: number;
  name: string;
  description: string;
  taskCount: number;
  color: string;
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
export class SkyComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private activityService = inject(ActivityService);
  private refreshInterval?: number;

  quickTaskTitle = signal('');
  showDateTimePicker = signal(false);
  taskDraftDate = signal('');
  taskDraftTime = signal('');

  // Real-time stats calculated from storage
  tasksCompletedToday = signal(0);
  tasksInProgress = signal(0);
  totalBoards = signal(0);

  ngOnInit(): void {
    // Initial load
    this.updateStats();

    if (typeof window !== 'undefined') {
      // Set up real-time updates every 2 seconds (browser only, skip during SSR)
      this.refreshInterval = window.setInterval(() => {
        this.updateStats();
      }, 2000);

      // Listen for storage changes (e.g., from other tabs or components)
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  /**
   * Handle storage events from other tabs/windows
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === STORAGE_KEY_TASKS || event.key === STORAGE_KEY_BOARDS) {
      this.updateStats();
    }
  }

  /**
   * Update all stats from storage in real-time
   */
  private updateStats(): void {
    // Get tasks from storage (normalize id to string for compatibility)
    const raw = this.storage.get<Array<{ id: number | string; [k: string]: unknown }>>(STORAGE_KEY_TASKS) ?? [];
    const tasks = raw.map(t => ({ ...t, id: String(t.id) })) as Task[];
    
    // Calculate tasks in progress (incomplete tasks)
    const incompleteTasks = tasks.filter(t => !t.completed);
    this.tasksInProgress.set(incompleteTasks.length);
    
    // Calculate tasks completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tasksCompletedToday = tasks.filter(task => {
      if (!task.completed) return false;
      // For now, we'll count all completed tasks as "today"
      // If you have a completedAt timestamp, use that instead
      return true;
    }).length;
    this.tasksCompletedToday.set(tasksCompletedToday);
    
    // Get boards from storage
    const boards = this.storage.get<Board[]>(STORAGE_KEY_BOARDS) ?? [];
    this.totalBoards.set(boards.length);
  }

  goToToday(): void {
    this.router.navigateByUrl('/today');
  }

  goToFocusMode(): void {
    this.router.navigateByUrl('/focus');
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
    const newTask: Task = {
      id: String(Date.now()),
      title,
      board: 'Today',
      dueTime,
      completed: false
    };
    if (this.auth.isLoggedIn()) {
      this.api.createTask({ title, board: 'Today', dueTime, completed: false }).subscribe({
        next: (created) => {
          this.storage.set(STORAGE_KEY_TASKS, [...existing, { ...newTask, id: created.id }]);
          this.activityService.logTaskCreated(title);
          this.updateStats();
        },
        error: () => {
          this.storage.set(STORAGE_KEY_TASKS, [...existing, newTask]);
          this.activityService.logTaskCreated(title);
          this.updateStats();
        }
      });
    } else {
      this.storage.set(STORAGE_KEY_TASKS, [...existing, newTask]);
      this.activityService.logTaskCreated(title);
      this.updateStats();
    }
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
