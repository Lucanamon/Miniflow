import { Component, signal, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EncouragementService } from '../../core/services/encouragement.service';
import { StorageService } from '../../core/services/storage.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService, ApiTask } from '../../core/services/api.service';
import { ActivityService } from '../../core/services/activity.service';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';

export interface Task {
  id: string;
  title: string;
  board: string;
  dueTime?: string;
  completed: boolean;
}

const STORAGE_KEY_TASKS_PREFIX = 'miniflow_tasks';
const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Review project proposal', board: 'Work Projects', dueTime: '10:00 AM', completed: false },
  { id: '2', title: 'Team standup meeting', board: 'Work Projects', dueTime: '11:00 AM', completed: false },
  { id: '3', title: 'Complete feature documentation', board: 'Work Projects', completed: false },
  { id: '4', title: 'Morning workout', board: 'Personal Goals', dueTime: '7:00 AM', completed: true }
];

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [FormsModule, ButtonComponent, CardComponent],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss'
})
export class TodayComponent implements OnInit {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private encouragementService = inject(EncouragementService);
  private activityService = inject(ActivityService);

  tasks = signal<Task[]>([]);
  loading = signal(true);
  emptyStateMessage = signal('');
  justCompletedTaskId = signal<string | null>(null);
  newTaskTitle = signal('');
  showDateTimePicker = signal(false);
  taskDraftDate = signal('');
  taskDraftTime = signal('');

  constructor() {
    // Sync tasks to current user's storage (for Sky/Focus)
    effect(() => {
      const t = this.tasks();
      if (t.length > 0) {
        this.storage.set(this.getTasksKey(), t);
      }
    });

    this.emptyStateMessage.set(this.encouragementService.getRandomEmptyStateMessage());
  }

  private getTasksKey(): string {
    const userId = this.auth.getUser()?.id ?? 'anonymous';
    return `${STORAGE_KEY_TASKS_PREFIX}_${userId}`;
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.loading.set(true);
    if (this.auth.isLoggedIn()) {
      // Backend is source of truth when logged in
      this.api.getTasks().subscribe({
        next: (apiTasks) => {
          this.tasks.set(this.apiTasksToTasks(apiTasks));
          this.loading.set(false);
        },
        error: () => {
          this.fallbackToStorage();
          this.loading.set(false);
        }
      });
    } else {
      const key = this.getTasksKey();
      const stored = this.storage.get<Array<{ id: number | string; title: string; board: string; dueTime?: string; completed: boolean }>>(key);
      this.tasks.set(stored && stored.length > 0 ? stored.map(t => ({ ...t, id: String(t.id) })) : DEFAULT_TASKS);
      this.loading.set(false);
    }
  }

  private apiTasksToTasks(apiTasks: ApiTask[]): Task[] {
    return apiTasks.map(t => ({
      id: t.id,
      title: t.title,
      board: t.board ?? 'Today',
      dueTime: t.dueTime ? this.formatDueTimeForDisplay(t.dueTime) : undefined,
      completed: t.completed
    }));
  }

  /** Normalize API/storage dueTime (ISO or display string) to consistent display format so it stays reliable after refresh. */
  formatDueTimeForDisplay(dueTime: string): string {
    if (!dueTime) return dueTime;
    const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dueTime) || dueTime.includes('T');
    if (!isoLike) return dueTime;
    const d = new Date(dueTime);
    if (Number.isNaN(d.getTime())) return dueTime;
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const timeStr = `${h}:${String(minutes).padStart(2, '0')} ${period}`;
    if (isToday) return timeStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${timeStr}`;
  }

  private fallbackToStorage(): void {
    const key = this.getTasksKey();
    const stored = this.storage.get<Array<{ id: number | string; title: string; board: string; dueTime?: string; completed: boolean }>>(key);
    this.tasks.set(stored && stored.length > 0 ? stored.map(t => ({ ...t, id: String(t.id) })) : DEFAULT_TASKS);
  }

  toggleTask(id: string): void {
    const task = this.tasks().find(t => t.id === id);
    const wasCompleted = task?.completed ?? false;

    this.tasks.update(tasks =>
      tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );

    if (!wasCompleted) {
      // Task was just completed - log activity
      this.activityService.logTaskCompleted(task?.title || 'Task');
      this.justCompletedTaskId.set(id);
      setTimeout(() => this.justCompletedTaskId.set(null), 2000);
    }

    if (this.auth.isLoggedIn()) {
      this.api.updateTask(id, { completed: !wasCompleted }).subscribe({
        error: () => this.loadTasks() // Revert on error
      });
    }
  }

  get incompleteTasks(): Task[] {
    return this.tasks().filter(t => !t.completed);
  }

  get completedTasks(): Task[] {
    return this.tasks().filter(t => t.completed);
  }

  deleteTask(id: string): void {
    const task = this.tasks().find(t => t.id === id);
    const taskTitle = task?.title || 'Task';

    if (this.auth.isLoggedIn()) {
      this.api.deleteTask(id).subscribe({
        next: () => {
          this.tasks.update(tasks => tasks.filter(t => t.id !== id));
          this.activityService.logTaskDeleted(taskTitle);
        },
        error: () => this.loadTasks()
      });
    } else {
      this.tasks.update(tasks => tasks.filter(t => t.id !== id));
      this.activityService.logTaskDeleted(taskTitle);
    }
  }

  /** Opens the date/time picker when user clicks Add task with a title (same flow as Sky Quick actions). */
  addTask(): void {
    const title = this.newTaskTitle().trim();
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
    this.newTaskTitle.set('');
  }

  confirmAddTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) {
      this.closeDateTimePicker();
      return;
    }
    const dateStr = this.taskDraftDate();
    const timeStr = this.taskDraftTime();
    const dueTimeDisplay = this.formatDueTime(dateStr, timeStr);
    const dueTimeIso = this.toISODateTime(dateStr, timeStr);

    const newTask: Task = {
      id: String(Date.now()),
      title,
      board: 'Today',
      dueTime: dueTimeDisplay,
      completed: false
    };

    if (this.auth.isLoggedIn()) {
      this.api.createTask({ title, board: 'Today', dueTime: dueTimeIso, completed: false }).subscribe({
        next: (created) => {
          this.tasks.update(tasks => [...tasks, { ...newTask, id: created.id }]);
          this.activityService.logTaskCreated(title);
          this.closeDateTimePicker();
        },
        error: () => {
          this.tasks.update(tasks => [...tasks, newTask]);
          this.activityService.logTaskCreated(title);
          this.closeDateTimePicker();
        }
      });
    } else {
      this.tasks.update(tasks => [...tasks, newTask]);
      this.activityService.logTaskCreated(title);
      this.closeDateTimePicker();
    }
  }

  /** ISO string for API (backend expects DateTime). */
  private toISODateTime(dateStr: string, timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date(dateStr);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
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
}
