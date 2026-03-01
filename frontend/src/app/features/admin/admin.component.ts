import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, User } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  users = signal<User[]>([]);
  currentUserId = (): string | null => this.auth.getUser()?.id ?? null;
  loading = signal(true);
  creating = signal(false);
  createError = signal('');
  deletingId = signal<string | null>(null);
  updatingRoleId = signal<string | null>(null);
  newEmail = '';
  newPassword = '';
  newName = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.api.getUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createAdmin(): void {
    this.createError.set('');
    this.creating.set(true);
    this.api.createAdmin({
      email: this.newEmail,
      password: this.newPassword,
      name: this.newName || undefined
    }).subscribe({
      next: () => {
        this.creating.set(false);
        this.newEmail = '';
        this.newPassword = '';
        this.newName = '';
        this.loadUsers();
      },
      error: (err) => {
        this.createError.set(err?.message ?? 'Failed to create admin');
        this.creating.set(false);
      }
    });
  }

  changeRole(u: User, newRole: string): void {
    if (newRole === (u.role || 'User')) return;
    this.updatingRoleId.set(u.id);
    this.api.updateUserRole(u.id, newRole).subscribe({
      next: () => {
        this.updatingRoleId.set(null);
        this.loadUsers();
      },
      error: () => {
        this.updatingRoleId.set(null);
        this.users.update(list => list.map(x => x.id === u.id ? { ...x, role: u.role } : x));
      }
    });
  }

  confirmDelete(u: User): void {
    if (!confirm(`Remove user "${u.email}"? This cannot be undone.`)) return;
    this.deletingId.set(u.id);
    this.api.deleteUser(u.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadUsers();
      },
      error: () => this.deletingId.set(null)
    });
  }

  formatDate(d: Date | string | undefined): string {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString(undefined, { dateStyle: 'short' });
  }
}
