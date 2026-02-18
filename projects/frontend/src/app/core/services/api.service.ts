import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ----- Response / request interfaces -----

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn?: number;
  user?: { id: string; username: string };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SaveProgressRequest {
  email: string;
  name?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  error?: unknown;
}

/** Central API service: uses environment.apiUrl, typed endpoints, RxJS error handling. Standalone-compatible (Angular 17+). */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** GET /health */
  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`).pipe(
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  /** GET /users */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  /** POST /auth/login */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  /** POST /users-prisma - Create a new user */
  createUser(userData: CreateUserRequest): Observable<User> {
    if (!environment.production) {
      console.log('[API] Creating user:', userData.email);
    }
    return this.http.post<User>(`${this.baseUrl}/users-prisma`, userData).pipe(
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  /** POST /users-prisma/save - Save progression (upsert) */
  saveProgress(progressData: SaveProgressRequest): Observable<User> {
    if (!environment.production) {
      console.log('[API] Saving progress for:', progressData.email);
    }
    return this.http.post<User>(`${this.baseUrl}/users-prisma/save`, progressData).pipe(
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  /** GET /users-prisma - Get all users with pagination */
  getUsersPaginated(page: number = 1, limit: number = 10): Observable<{ data: User[]; total: number; page: number; limit: number }> {
    return this.http.get<{ data: User[]; total: number; page: number; limit: number }>(
      `${this.baseUrl}/users-prisma?page=${page}&limit=${limit}`
    ).pipe(
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  /** GET /users-prisma/:id - Get user by ID */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users-prisma/${id}`).pipe(
      catchError((err) => throwError(() => this.normalizeError(err)))
    );
  }

  private normalizeError(err: unknown): ApiError {
    if (err && typeof err === 'object' && 'error' in err) {
      const e = err as { status?: number; error?: unknown; message?: string };
      return {
        message: typeof e.error === 'object' && e.error !== null && 'message' in e.error
          ? String((e.error as { message: string }).message)
          : e.message ?? 'Request failed',
        status: e.status,
        error: e.error,
      };
    }
    return {
      message: err instanceof Error ? err.message : 'Request failed',
      error: err,
    };
  }
}
