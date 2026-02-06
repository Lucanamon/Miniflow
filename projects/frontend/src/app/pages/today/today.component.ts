import { Component, signal } from '@angular/core';

interface Task {
  id: number;
  title: string;
  board: string;
  dueTime?: string;
  completed: boolean;
}

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss'
})
export class TodayComponent {
  tasks = signal<Task[]>([
    { id: 1, title: 'Review project proposal', board: 'Work Projects', dueTime: '10:00 AM', completed: false },
    { id: 2, title: 'Team standup meeting', board: 'Work Projects', dueTime: '11:00 AM', completed: false },
    { id: 3, title: 'Complete feature documentation', board: 'Work Projects', completed: false },
    { id: 4, title: 'Morning workout', board: 'Personal Goals', dueTime: '7:00 AM', completed: true }
  ]);

  toggleTask(id: number) {
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  get incompleteTasks() {
    return this.tasks().filter(t => !t.completed);
  }

  get completedTasks() {
    return this.tasks().filter(t => t.completed);
  }
}
