import { Component, signal, OnInit } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormsModule } from '@angular/forms';
import { EncouragementService } from '../../core/services/encouragement.service';

@Component({
  selector: 'app-sky',
  standalone: true,
  imports: [ButtonComponent, CardComponent, FormsModule],
  templateUrl: './sky.component.html',
  styleUrl: './sky.component.scss'
})
export class SkyComponent implements OnInit {
  currentEncouragement = signal('');
  quickTaskTitle = signal('');
  
  // Mock stats - replace with real data later
  tasksCompletedToday = signal(3);
  tasksInProgress = signal(5);
  totalBoards = signal(2);
  currentStreak = signal(7);

  constructor(private encouragementService: EncouragementService) {}

  ngOnInit() {
    // Get random encouragement message
    this.currentEncouragement.set(this.encouragementService.getRandomMessage());
  }

  createQuickTask() {
    if (this.quickTaskTitle().trim()) {
      // TODO: Implement task creation
      console.log('Creating task:', this.quickTaskTitle());
      this.quickTaskTitle.set('');
      // Show success feedback
    }
  }
}
