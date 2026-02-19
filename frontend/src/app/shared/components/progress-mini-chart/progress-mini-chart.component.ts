import { Component, signal, OnInit, OnDestroy } from '@angular/core';

interface TimezoneInfo {
  city: string;
  timezone: string;
  time: string;
  date: string;
  offset: string;
}

@Component({
  selector: 'app-progress-mini-chart',
  standalone: true,
  imports: [],
  templateUrl: './progress-mini-chart.component.html',
  styleUrl: './progress-mini-chart.component.scss'
})
export class ProgressMiniChartComponent implements OnInit, OnDestroy {
  private updateInterval?: number;

  timezones = signal<TimezoneInfo[]>([
    { city: 'New York', timezone: 'America/New_York', time: '', date: '', offset: '' },
    { city: 'London', timezone: 'Europe/London', time: '', date: '', offset: '' },
    { city: 'Oceanic', timezone: 'Australia/Sydney', time: '', date: '', offset: '' },
    { city: 'Thailand', timezone: 'Asia/Bangkok', time: '', date: '', offset: '' }
  ]);

  ngOnInit(): void {
    this.updateTimes();
    // Update every second for real-time display (browser only, skip during SSR)
    if (typeof window !== 'undefined') {
      this.updateInterval = window.setInterval(() => {
        this.updateTimes();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.updateInterval && typeof window !== 'undefined') {
      clearInterval(this.updateInterval);
    }
  }

  private updateTimes(): void {
    const now = new Date();
    const updated = this.timezones().map(tz => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz.timezone,
        month: 'short',
        day: 'numeric'
      });
      
      const timeStr = formatter.format(now);
      const dateStr = dateFormatter.format(now);
      
      // Calculate UTC offset
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz.timezone }));
      const offsetMs = tzDate.getTime() - utcDate.getTime();
      const offsetHours = Math.floor(Math.abs(offsetMs) / (1000 * 60 * 60));
      const offsetMins = Math.floor((Math.abs(offsetMs) % (1000 * 60 * 60)) / (1000 * 60));
      const offsetSign = offsetMs >= 0 ? '+' : '-';
      const offsetStr = offsetMins > 0 
        ? `UTC${offsetSign}${offsetHours}:${String(offsetMins).padStart(2, '0')}`
        : `UTC${offsetSign}${offsetHours}`;

      return {
        ...tz,
        time: timeStr,
        date: dateStr,
        offset: offsetStr
      };
    });

    this.timezones.set(updated);
  }
}
