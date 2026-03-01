import { Component, signal, effect, inject, OnInit } from '@angular/core';
import { EncouragementService } from '../../core/services/encouragement.service';
import { StorageService } from '../../core/services/storage.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService, ApiTask } from '../../core/services/api.service';
import { ActivityService } from '../../core/services/activity.service';

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
  imports: [],
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
      dueTime: t.dueTime ?? undefined,
      completed: t.completed
    }));
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

  addTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const newTask: Task = {
      id: String(Date.now()),
      title,
      board: 'Today',
      completed: false
    };

    if (this.auth.isLoggedIn()) {
      this.api.createTask({ title, board: 'Today', completed: false }).subscribe({
        next: (created) => {
          this.tasks.update(tasks => [...tasks, { ...newTask, id: created.id }]);
          this.activityService.logTaskCreated(title);
          this.newTaskTitle.set('');
        },
        error: () => {
          this.tasks.update(tasks => [...tasks, newTask]);
          this.activityService.logTaskCreated(title);
          this.newTaskTitle.set('');
        }
      });
    } else {
      this.tasks.update(tasks => [...tasks, newTask]);
      this.activityService.logTaskCreated(title);
      this.newTaskTitle.set('');
    }
  }
}
