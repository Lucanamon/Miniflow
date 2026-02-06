import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EncouragementService } from '../../core/services/encouragement.service';

interface CompletedTask {
  id: number;
  title: string;
  board: string;
  completedAt: string;
}

type MoodTag = 'productive' | 'challenging' | 'satisfying' | 'calm' | 'energetic';

@Component({
  selector: 'app-reflection',
  standalone: true,
  imports: [FormsModule, ButtonComponent, CardComponent],
  templateUrl: './reflection.component.html',
  styleUrl: './reflection.component.scss'
})
export class ReflectionComponent {
  completedTasks = signal<CompletedTask[]>([
    { id: 1, title: 'Review project proposal', board: 'Work Projects', completedAt: '9:30 AM' },
    { id: 2, title: 'Team standup meeting', board: 'Work Projects', completedAt: '11:15 AM' },
    { id: 3, title: 'Morning workout', board: 'Personal Goals', completedAt: '7:00 AM' }
  ]);

  dailyNote = signal('');
  selectedMoods = signal<MoodTag[]>([]);
  emptyStateMessage = signal('');

  constructor(private encouragementService: EncouragementService) {
    this.emptyStateMessage.set(this.encouragementService.getRandomEmptyStateMessage());
  }

  moodTags: { value: MoodTag; label: string; icon: string }[] = [
    { value: 'productive', label: 'Productive', icon: '⭐' },
    { value: 'challenging', label: 'Challenging', icon: '💪' },
    { value: 'satisfying', label: 'Satisfying', icon: '✨' },
    { value: 'calm', label: 'Calm', icon: '🌙' },
    { value: 'energetic', label: 'Energetic', icon: '⚡' }
  ];

  toggleMood(mood: MoodTag) {
    this.selectedMoods.update(moods => {
      if (moods.includes(mood)) {
        return moods.filter(m => m !== mood);
      } else {
        return [...moods, mood];
      }
    });
  }

  saveReflection() {
    // TODO: Save reflection data
    console.log('Saving reflection:', {
      note: this.dailyNote(),
      moods: this.selectedMoods(),
      tasksCompleted: this.completedTasks().length
    });
    // Show success message
  }
}
