import { Component, signal, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { ButtonComponent } from '../../shared/components/button.component';

interface Task {
  id: string;
  title: string;
  board: string;
  dueTime?: string;
  completed: boolean;
}

const STORAGE_KEY_TASKS = 'miniflow_tasks';
const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.scss'
})
export class FocusComponent implements OnInit, OnDestroy {
  private storage = inject(StorageService);
  private router = inject(Router);
  private timerInterval: number | null = null;

  // Load tasks from storage (normalize id to string)
  tasks = signal<Task[]>(
    (this.storage.get<Array<{ id: number | string; title: string; board: string; dueTime?: string; completed: boolean }>>(STORAGE_KEY_TASKS) ?? []).map(t => ({ ...t, id: String(t.id) }))
  );

  // Timer state
  timerSeconds = signal(POMODORO_DURATION);
  isTimerRunning = signal(false);
  currentTaskIndex = signal(0);

  constructor() {
    // Auto-save tasks whenever they change
    effect(() => {
      this.storage.set(STORAGE_KEY_TASKS, this.tasks());
    });
  }

  ngOnInit() {
    // Start timer automatically when entering focus mode
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  get incompleteTasks() {
    return this.tasks().filter(t => !t.completed);
  }

  get currentTask() {
    const incomplete = this.incompleteTasks;
    const index = this.currentTaskIndex();
    return incomplete.length > 0 ? incomplete[index] : null;
  }

  get formattedTime() {
    const total = this.timerSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  startTimer() {
    if (this.timerInterval) return;
    this.isTimerRunning.set(true);
    this.timerInterval = window.setInterval(() => {
      const current = this.timerSeconds();
      if (current <= 1) {
        this.completeTimer();
        return;
      }
      this.timerSeconds.set(current - 1);
    }, 1000);
  }

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning.set(false);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning.set(false);
  }

  resetTimer() {
    this.stopTimer();
    this.timerSeconds.set(POMODORO_DURATION);
  }

  completeTimer() {
    this.stopTimer();
    // Timer completed - could show notification or sound
    if (confirm('Focus session complete! Take a break?')) {
      this.exitFocusMode();
    } else {
      this.resetTimer();
      this.startTimer();
    }
  }

  completeCurrentTask() {
    const task = this.currentTask;
    if (!task) return;

    this.tasks.update(tasks =>
      tasks.map(t =>
        t.id === task.id ? { ...t, completed: true } : t
      )
    );

    // Move to next task or reset to first if no more tasks
    const incomplete = this.incompleteTasks;
    if (incomplete.length === 0) {
      // All tasks done!
      setTimeout(() => {
        if (confirm('All tasks completed! Exit Focus Mode?')) {
          this.exitFocusMode();
        }
      }, 500);
    } else {
      // Move to next task, wrap around if needed
      const currentIndex = this.currentTaskIndex();
      const nextIndex = (currentIndex + 1) % incomplete.length;
      this.currentTaskIndex.set(nextIndex);
    }
  }

  skipTask() {
    const incomplete = this.incompleteTasks;
    if (incomplete.length <= 1) return;
    const currentIndex = this.currentTaskIndex();
    const nextIndex = (currentIndex + 1) % incomplete.length;
    this.currentTaskIndex.set(nextIndex);
  }

  exitFocusMode() {
    this.stopTimer();
    this.router.navigateByUrl('/sky');
  }
}
