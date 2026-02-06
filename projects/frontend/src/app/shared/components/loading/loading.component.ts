import { Component, input } from '@angular/core';
import { EncouragementService } from '../../../core/services/encouragement.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  message = input<string>();
  size = input<'sm' | 'md' | 'lg'>('md');

  constructor(private encouragementService: EncouragementService) {}

  get displayMessage(): string {
    return this.message() || this.encouragementService.getRandomLoadingMessage();
  }
}
