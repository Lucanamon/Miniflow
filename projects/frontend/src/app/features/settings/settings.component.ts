import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { AuthComponent } from '../auth/auth.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CardComponent, AuthComponent],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure your Miniflow experience</p>
      </div>
      <app-auth />
      <app-card title="Settings" subtitle="Coming soon">
        <p>Settings configuration will be available here.</p>
      </app-card>
    </div>
  `,
  styles: [`
    .settings-page {
      padding: 10px;
      min-height: 100vh;
      position: relative;
      max-width: 800px;
      margin: 0 auto;
      
      /* Cool Tech/Admin Theme - Teal and Cyan tones */
      background: 
        /* Base dark teal gradient */
        linear-gradient(180deg, #0a1a1a 0%, #1a2a2a 25%, #2a3a3a 50%, #1a2a2a 75%, #0a1a1a 100%),
        /* Cool cyan glow from top */
        radial-gradient(ellipse at 50% 0%, 
          rgba(74, 179, 160, 0.3) 0%,
          rgba(58, 139, 122, 0.2) 25%,
          rgba(74, 179, 160, 0.1) 50%,
          transparent 70%
        ),
        /* Teal accent */
        radial-gradient(circle at 30% 25%, rgba(58, 139, 122, 0.2) 0%, transparent 45%),
        /* Cyan ambient light */
        radial-gradient(circle at 70% 20%, rgba(74, 179, 160, 0.15) 0%, transparent 50%);
    }
    
    .settings-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(1px 1px at 20% 30%, rgba(74, 179, 160, 0.3), transparent),
        radial-gradient(1px 1px at 60% 70%, rgba(58, 139, 122, 0.25), transparent),
        radial-gradient(0.5px 0.5px at 50% 50%, rgba(74, 179, 160, 0.2), transparent),
        radial-gradient(1px 1px at 80% 10%, rgba(74, 179, 160, 0.2), transparent);
      background-size: 300% 300%;
      background-position: 0% 0%;
      opacity: 0.4;
      pointer-events: none;
      z-index: 0;
      animation: subtleStarShift 60s ease-in-out infinite;
    }
    
    .settings-page {
      z-index: 1;
      position: relative;
    }
    
    .settings-page > * {
      position: relative;
      z-index: 2;
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
