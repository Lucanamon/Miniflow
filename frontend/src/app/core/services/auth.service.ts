import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'miniflow_auth_token';
const USER_KEY = 'miniflow_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storage = inject(StorageService);

  saveToken(token: string): void {
    this.storage.set(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.storage.get<string>(TOKEN_KEY);
  }

  removeToken(): void {
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
  }

  saveUser(user: AuthUser): void {
    this.storage.set(USER_KEY, user);
  }

  getUser(): AuthUser | null {
    return this.storage.get<AuthUser>(USER_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const role = this.getUser()?.role;
    return role === 'Admin' || role === 'RootAdmin';
  }

  logout(): void {
    this.removeToken();
  }
}
