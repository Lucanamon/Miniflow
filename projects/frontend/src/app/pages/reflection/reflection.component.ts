import { Component, signal, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button.component';
import { StorageService } from '../../core/services/storage.service';

interface CompletedTask {
  id: number;
  title: string;
  board: string;
  completedAt: string;
}

type MoodTag = 'productive' | 'challenging' | 'satisfying' | 'calm' | 'energetic';

const STORAGE_KEY_REFLECTION_NOTE = 'miniflow_reflection_note';
const STORAGE_KEY_REFLECTION_MOODS = 'miniflow_reflection_moods';

@Component({
  selector: 'app-reflection',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './reflection.component.html',
  styleUrl: './reflection.component.scss'
})
export class ReflectionComponent implements OnInit {
  private storage = inject(StorageService);

  completedTasks = signal<CompletedTask[]>([
    { id: 1, title: 'Review project proposal', board: 'Work Projects', completedAt: '9:30 AM' },
    { id: 2, title: 'Team standup meeting', board: 'Work Projects', completedAt: '11:15 AM' },
    { id: 3, title: 'Morning workout', board: 'Personal Goals', completedAt: '7:00 AM' }
  ]);

  dailyNote = signal('');
  selectedMoods = signal<MoodTag[]>([]);
  saveSuccessMessage = signal('');

  moodTags: { value: MoodTag; label: string; icon: string }[] = [
    { value: 'productive', label: 'Productive', icon: '⭐' },
    { value: 'challenging', label: 'Challenging', icon: '💪' },
    { value: 'satisfying', label: 'Satisfying', icon: '✨' },
    { value: 'calm', label: 'Calm', icon: '🌙' },
    { value: 'energetic', label: 'Energetic', icon: '⚡' }
  ];

  ngOnInit() {
    // Load saved data from storage
    const savedNote = this.storage.get<string>(STORAGE_KEY_REFLECTION_NOTE);
    const savedMoods = this.storage.get<MoodTag[]>(STORAGE_KEY_REFLECTION_MOODS);

    if (savedNote) {
      this.dailyNote.set(savedNote);
    }
    if (savedMoods) {
      this.selectedMoods.set(savedMoods);
    }

    // Auto-save daily note on changes
    effect(() => {
      const note = this.dailyNote();
      if (note !== null) {
        this.storage.set(STORAGE_KEY_REFLECTION_NOTE, note);
      }
    });

    // Auto-save moods on changes
    effect(() => {
      this.storage.set(STORAGE_KEY_REFLECTION_MOODS, this.selectedMoods());
    });
  }

  toggleMood(mood: MoodTag) {
    this.selectedMoods.update(moods => {
      if (moods.includes(mood)) {
        return moods.filter(m => m !== mood);
      } else {
        return [...moods, mood];
      }
    });
    // Auto-saved by effect()
  }

  saveReflection() {
    // Data is already auto-saved via effects, but we can show confirmation
    const reflectionData = {
      note: this.dailyNote(),
      moods: this.selectedMoods(),
      tasksCompleted: this.completedTasks().length,
      date: new Date().toISOString()
    };

    console.log('Reflection saved:', reflectionData);

    // Show success message
    this.saveSuccessMessage.set('Reflection saved!');
    setTimeout(() => {
      this.saveSuccessMessage.set('');
    }, 3000);
  }
}
