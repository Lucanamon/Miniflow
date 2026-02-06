import { Injectable, signal } from '@angular/core';

export interface DailyProgress {
  date: string;
  label: string;
  completed: number;
}

export type ActivityType = 'completed' | 'created' | 'board_updated';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  timestamp: Date;
}

export interface ReflectionEntry {
  date: string;
  note: string;
  mood: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  /** Tasks completed per day for last 7 days - future ready for API */
  readonly weeklyProgress = signal<DailyProgress[]>([
    { date: '2026-02-01', label: 'Mon', completed: 4 },
    { date: '2026-02-02', label: 'Tue', completed: 6 },
    { date: '2026-02-03', label: 'Wed', completed: 3 },
    { date: '2026-02-04', label: 'Thu', completed: 7 },
    { date: '2026-02-05', label: 'Fri', completed: 5 },
    { date: '2026-02-06', label: 'Sat', completed: 2 },
    { date: '2026-02-07', label: 'Sun', completed: 0 },
  ]);

  /** Last 5 task events - future ready for API */
  readonly recentActivity = signal<ActivityEvent[]>([
    { id: '1', type: 'completed', title: 'Update dashboard spacing', timestamp: new Date(Date.now() - 3600000) },
    { id: '2', type: 'created', title: 'Reflection page layout', timestamp: new Date(Date.now() - 7200000) },
    { id: '3', type: 'completed', title: 'Navbar polish', timestamp: new Date(Date.now() - 14400000) },
    { id: '4', type: 'board_updated', title: 'Constellations board', timestamp: new Date(Date.now() - 21600000) },
    { id: '5', type: 'completed', title: 'Theme token updates', timestamp: new Date(Date.now() - 28800000) },
  ]);

  /** Last reflection entry - future ready for API */
  readonly lastReflection = signal<ReflectionEntry>({
    date: new Date().toISOString().split('T')[0],
    note: 'Today I made steady progress.',
    mood: 'Calm',
  });

  /** Future: replace with API calls */
  // getWeeklyProgress() { return this.http.get<DailyProgress[]>(...); }
  // getRecentActivity() { return this.http.get<ActivityEvent[]>(...); }
  // getLastReflection() { return this.http.get<ReflectionEntry>(...); }
}
