import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  title = input<string>();
  subtitle = input<string>();
  variant = input<'default' | 'highlight' | 'success'>('default');
  hoverable = input<boolean>(true);
}
