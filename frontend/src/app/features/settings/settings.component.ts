import { Component, inject, computed } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { ThemeService } from '../../core/services/theme.service';

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

      <app-card title="Theme" subtitle="Choose how Miniflow looks">
        <div class="setting-group">
          <h2 class="setting-label">Color theme</h2>
          <p class="setting-description">
            Switch between the default <strong>Sky</strong> theme and a mono white / black
            <strong>Andromeda</strong> theme with a white background and black header.
          </p>
          <div class="theme-options">
            <button
              type="button"
              class="theme-chip"
              [class.selected]="currentTheme() === 'sky'"
              (click)="setTheme('sky')"
            >
              <span class="theme-dot theme-dot-sky"></span>
              <span class="theme-chip-title">Sky</span>
              <span class="theme-chip-subtitle">Current colorful starry palette</span>
            </button>

            <button
              type="button"
              class="theme-chip"
              [class.selected]="currentTheme() === 'andromeda'"
              (click)="setTheme('andromeda')"
            >
              <span class="theme-dot theme-dot-andromeda"></span>
              <span class="theme-chip-title">Andromeda</span>
              <span class="theme-chip-subtitle">
                White background, black header bar, center cards keep their existing colors
              </span>
            </button>
          </div>
        </div>
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

    .setting-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .setting-label {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .setting-description {
      font-size: 0.9rem;
      max-width: 36rem;
    }

    .theme-options {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-xs);
    }

    .theme-chip {
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.5);
      padding: 0.5rem 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.4);
      color: var(--text-secondary);
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      min-width: 0;
    }

    .theme-chip:hover {
      border-color: rgba(125, 211, 252, 0.6);
      box-shadow: 0 0 0 1px rgba(125, 211, 252, 0.4);
    }

    .theme-chip.selected {
      border-color: rgba(125, 211, 252, 0.9);
      background: radial-gradient(circle at 0% 0%, rgba(125, 211, 252, 0.18), rgba(15, 23, 42, 0.7));
      color: var(--text-primary);
      box-shadow: 0 0 0 1px rgba(125, 211, 252, 0.8);
    }

    .theme-dot {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      flex-shrink: 0;
      border: 2px solid rgba(15, 23, 42, 0.9);
      box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.5);
    }

    .theme-dot-sky {
      background: radial-gradient(circle at 30% 0%, #f4d03f, #7dd3fc);
    }

    .theme-dot-andromeda {
      background: conic-gradient(from 45deg, #000 0deg, #000 180deg, #fff 181deg, #fff 360deg);
    }

    .theme-chip-title {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .theme-chip-subtitle {
      font-size: 0.8rem;
      opacity: 0.85;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 16rem;
    }

    @media (max-width: 600px) {
      .theme-options {
        flex-direction: column;
        align-items: stretch;
      }

      .theme-chip {
        width: 100%;
        justify-content: flex-start;
      }
    }
  `]
})
export class SettingsComponent {
  private themeService = inject(ThemeService);

  readonly currentTheme = computed(() => this.themeService.currentTheme());

  setTheme(theme: 'sky' | 'andromeda'): void {
    this.themeService.setTheme(theme);
  }
}
