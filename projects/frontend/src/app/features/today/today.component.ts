import { Component, signal, effect, inject } from '@angular/core';
import { EncouragementService } from '../../core/services/encouragement.service';
import { StorageService } from '../../core/services/storage.service';

interface Task {
  id: number;
  title: string;
  board: string;
  dueTime?: string;
  completed: boolean;
}

const STORAGE_KEY_TASKS = 'miniflow_tasks';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss'
})
export class TodayComponent {
  private storage = inject(StorageService);
  private encouragementService = inject(EncouragementService);

  // Load tasks from storage on init, fallback to defaults
  tasks = signal<Task[]>(
    this.storage.get<Task[]>(STORAGE_KEY_TASKS) ?? [
      { id: 1, title: 'Review project proposal', board: 'Work Projects', dueTime: '10:00 AM', completed: false },
      { id: 2, title: 'Team standup meeting', board: 'Work Projects', dueTime: '11:00 AM', completed: false },
      { id: 3, title: 'Complete feature documentation', board: 'Work Projects', completed: false },
      { id: 4, title: 'Morning workout', board: 'Personal Goals', dueTime: '7:00 AM', completed: true }
    ]
  );

  emptyStateMessage = signal('');
  justCompletedTaskId = signal<number | null>(null);

  constructor() {
    // Auto-save tasks whenever they change
    effect(() => {
      this.storage.set(STORAGE_KEY_TASKS, this.tasks());
    });

    this.emptyStateMessage.set(this.encouragementService.getRandomEmptyStateMessage());
  }

  toggleTask(id: number) {
    const task = this.tasks().find(t => t.id === id);
    const wasCompleted = task?.completed || false;
    
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );

    // Show success glow if task was just completed
    if (!wasCompleted) {
      this.justCompletedTaskId.set(id);
      setTimeout(() => this.justCompletedTaskId.set(null), 2000);
    }
  }

  get incompleteTasks() {
    return this.tasks().filter(t => !t.completed);
  }

  get completedTasks() {
    return this.tasks().filter(t => t.completed);
  }
}
