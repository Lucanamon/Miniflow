import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CardComponent],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure your Miniflow experience</p>
      </div>
      <app-card title="Settings" subtitle="Coming soon">
        <p>Settings configuration will be available here.</p>
      </app-card>
    </div>
  `,
  styles: [`
    .settings-page {
      padding: var(--spacing-md) 0;
    }
    .page-header {
      margin-bottom: var(--spacing-lg);
    }
    .page-title {
      margin: 0 0 var(--spacing-xs) 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .page-subtitle {
      margin: 0;
      color: var(--text-muted);
      font-size: 1rem;
    }
    p {
      color: var(--text-muted);
    }
  `]
})
export class SettingsComponent {}
