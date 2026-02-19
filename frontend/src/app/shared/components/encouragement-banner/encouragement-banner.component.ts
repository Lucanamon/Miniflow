import { Component, OnInit, OnDestroy, signal, inject, input } from '@angular/core';
import { EncouragementService, EncouragementContext } from '../../../core/services/encouragement.service';

@Component({
  selector: 'app-encouragement-banner',
  standalone: true,
  imports: [],
  templateUrl: './encouragement-banner.component.html',
  styleUrl: './encouragement-banner.component.scss'
})
export class EncouragementBannerComponent implements OnInit, OnDestroy {
  private encouragementService = inject(EncouragementService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  currentMessage = signal('');
  isVisible = signal(true);
  context = input<EncouragementContext>('dashboard');

  ngOnInit() {
    this.currentMessage.set(
      this.encouragementService.getMessageByContext(this.context())
    );
    this.intervalId = setInterval(() => this.cycleMessage(), 15000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private cycleMessage() {
    this.isVisible.set(false);
    setTimeout(() => {
      this.currentMessage.set(
        this.encouragementService.getMessageByContext(this.context())
      );
      this.isVisible.set(true);
    }, 400);
  }
}
