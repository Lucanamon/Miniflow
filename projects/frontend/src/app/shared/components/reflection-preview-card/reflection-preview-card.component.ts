import { Component, inject, computed } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-reflection-preview-card',
  standalone: true,
  imports: [],
  templateUrl: './reflection-preview-card.component.html',
  styleUrl: './reflection-preview-card.component.scss'
})
export class ReflectionPreviewCardComponent {
  private mockData = inject(MockDataService);

  reflection = this.mockData.lastReflection;

  formattedDate = computed(() => {
    const r = this.reflection();
    if (!r?.date) return '';
    try {
      return new Date(r.date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return r.date;
    }
  });

  getMoodEmoji(mood: string): string {
    const moodMap: Record<string, string> = {
      calm: '🌙',
      happy: '✨',
      focused: '🎯',
      tired: '😌',
      motivated: '🔥',
      peaceful: '☁️',
      reflective: '🔮',
    };
    return moodMap[mood.toLowerCase()] ?? '🌙';
  }
}
