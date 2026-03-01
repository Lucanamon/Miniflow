import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ActivityService } from '../../core/services/activity.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  title = 'Miniflow';

  private auth = inject(AuthService);
  private router = inject(Router);
  private activityService = inject(ActivityService);

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get userEmail(): string | null {
    return this.auth.getUser()?.email ?? null;
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  logout(): void {
    this.auth.logout();
    this.activityService.reloadForCurrentUser();
    this.router.navigateByUrl('/login');
  }
}
