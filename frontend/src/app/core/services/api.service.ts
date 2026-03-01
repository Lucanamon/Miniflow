import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// ----- Response / request interfaces -----

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  expiresIn?: number;
  user?: { id: string; email: string; name?: string; role?: string };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiError {
  message: string;
  status?: number;
  error?: unknown;
}

export interface ApiTask {
  id: string;
  title: string;
  board?: string;
  dueTime?: string | null;
  completed: boolean;
  userId: string;
  createdAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  board?: string;
  dueTime?: string;
  completed?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  board?: string;
  dueTime?: string;
  completed?: boolean;
}

export interface DeleteTaskResponse {
  message: string;
}

export interface ApiBoard {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt?: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  color?: string;
}

type AuthHeaders = { headers?: Record<string, string> };

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;

  private authOptions(): AuthHeaders {
    const token = this.auth.getToken();
    if (!token) return {};
    return { headers: { Authorization: 'Bearer ' + token } };
  }

  private handleError(err: unknown): never {
    throw this.normalizeError(err);
  }

  private normalizeError(err: unknown): ApiError {
    if (err && typeof err === 'object' && 'error' in err) {
      const e = err as { status?: number; error?: unknown; message?: string };
      const msg =
        typeof e.error === 'object' && e.error !== null && 'message' in e.error
          ? String((e.error as { message: string }).message)
          : e.message ?? 'Request failed';
      return { message: msg, status: e.status, error: e.error };
    }
    return {
      message: err instanceof Error ? err.message : 'Request failed',
      error: err,
    };
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(this.baseUrl + '/health').pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + '/users', this.authOptions()).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  createAdmin(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl + '/admin/users', data, this.authOptions()).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/admin/users/' + encodeURIComponent(id), this.authOptions()).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  updateUserRole(id: string, role: string): Observable<User> {
    return this.http
      .patch<User>(this.baseUrl + '/admin/users/' + encodeURIComponent(id) + '/role', { role }, this.authOptions())
      .pipe(
        catchError((e) => {
          this.handleError(e);
        })
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/auth/register', data).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/auth/login', credentials).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  getTasks(): Observable<ApiTask[]> {
    return this.http.get<ApiTask[]>(this.baseUrl + '/tasks', this.authOptions()).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  createTask(data: CreateTaskRequest): Observable<ApiTask> {
    return this.http.post<ApiTask>(this.baseUrl + '/tasks', data, this.authOptions()).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  updateTask(id: string, data: UpdateTaskRequest): Observable<ApiTask> {
    return this.http
      .patch<ApiTask>(this.baseUrl + '/tasks/' + id, data, this.authOptions())
      .pipe(
        catchError((e) => {
          this.handleError(e);
        })
      );
  }

  deleteTask(id: string): Observable<DeleteTaskResponse> {
    return this.http
      .delete<DeleteTaskResponse>(this.baseUrl + '/tasks/' + id, this.authOptions())
      .pipe(
        catchError((e) => {
          this.handleError(e);
        })
      );
  }

  getBoards(): Observable<ApiBoard[]> {
    return this.http.get<ApiBoard[]>(this.baseUrl + '/boards', this.authOptions()).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  createBoard(data: CreateBoardRequest): Observable<ApiBoard> {
    return this.http.post<ApiBoard>(this.baseUrl + '/boards', data, this.authOptions()).pipe(
      catchError((e) => {
        this.handleError(e);
      })
    );
  }

  updateBoard(id: string, data: UpdateBoardRequest): Observable<ApiBoard> {
    return this.http
      .patch<ApiBoard>(this.baseUrl + '/boards/' + encodeURIComponent(id), data, this.authOptions())
      .pipe(
        catchError((e) => {
          this.handleError(e);
        })
      );
  }

  deleteBoard(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(this.baseUrl + '/boards/' + encodeURIComponent(id), this.authOptions())
      .pipe(
        catchError((e) => {
          this.handleError(e);
        })
      );
  }
}
