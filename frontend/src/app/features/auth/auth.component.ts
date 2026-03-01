import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ActivityService } from '../../core/services/activity.service';
import { ButtonComponent } from '../../shared/components/button.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  template: `
    <div class="auth-card">
      @if (auth.isLoggedIn()) {
        <div class="auth-logged-in">
          <p>Logged in as <strong>{{ auth.getUser()?.email }}</strong></p>
          <app-button variant="outline" size="md" (click)="logout()">Logout</app-button>
        </div>
      } @else {
        <div class="auth-forms">
          <div class="auth-section">
            <h3>Login</h3>
            <form (ngSubmit)="login()" class="auth-form">
              <input type="email" [(ngModel)]="loginEmail" name="loginEmail" placeholder="Email" required />
              <input type="password" [(ngModel)]="loginPassword" name="loginPassword" placeholder="Password" required />
              @if (error()) {
                <p class="auth-error">{{ error() }}</p>
              }
              <app-button type="submit" variant="primary" size="md" [disabled]="loading()">
                {{ loading() ? 'Logging in...' : 'Login' }}
              </app-button>
            </form>
          </div>
          <div class="auth-section">
            <h3>Register</h3>
            <form (ngSubmit)="register()" class="auth-form">
              <input type="email" [(ngModel)]="regEmail" name="regEmail" placeholder="Email" required />
              <input type="password" [(ngModel)]="regPassword" name="regPassword" placeholder="Password (min 6)" required minlength="6" />
              <input type="text" [(ngModel)]="regName" name="regName" placeholder="Name (optional)" />
              @if (regError()) {
                <p class="auth-error">{{ regError() }}</p>
              }
              <app-button type="submit" variant="outline" size="md" [disabled]="regLoading()">
                {{ regLoading() ? 'Registering...' : 'Register' }}
              </app-button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .auth-card {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
    }
    .auth-logged-in {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .auth-logged-in p { margin: 0; color: var(--text-primary); }
    .auth-forms { display: flex; gap: 2rem; flex-wrap: wrap; }
    .auth-section { flex: 1; min-width: 200px; }
    .auth-section h3 { margin: 0 0 0.75rem 0; font-size: 1rem; color: var(--text-primary); }
    .auth-form { display: flex; flex-direction: column; gap: 0.5rem; }
    .auth-form input {
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.2);
      color: var(--text-primary);
    }
    .auth-error { color: #ef4444; font-size: 0.875rem; margin: 0; }
  `]
})
export class AuthComponent {
  auth = inject(AuthService);
  api = inject(ApiService);
  router = inject(Router);
  activityService = inject(ActivityService);

  loginEmail = '';
  loginPassword = '';
  regEmail = '';
  regPassword = '';
  regName = '';
  loading = signal(false);
  regLoading = signal(false);
  error = signal('');
  regError = signal('');

  login(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: (res) => {
        this.auth.saveToken(res.access_token);
        if (res.user) this.auth.saveUser(res.user);
        this.activityService.reloadForCurrentUser();
        this.loading.set(false);
        this.router.navigateByUrl('/today'); // Sync: navigate to Today to load server tasks
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Login failed');
        this.loading.set(false);
      }
    });
  }

  register(): void {
    this.regError.set('');
    this.regLoading.set(true);
    this.api.register({
      email: this.regEmail,
      password: this.regPassword,
      name: this.regName || undefined
    }).subscribe({
      next: (res) => {
        this.auth.saveToken(res.access_token);
        if (res.user) this.auth.saveUser(res.user);
        this.activityService.reloadForCurrentUser();
        this.regLoading.set(false);
        this.router.navigateByUrl('/today');
      },
      error: (err) => {
        this.regError.set(err?.message ?? 'Registration failed');
        this.regLoading.set(false);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.activityService.reloadForCurrentUser();
  }
}
