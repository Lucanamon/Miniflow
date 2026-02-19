/** Declaration for @angular/common/http when package types are not resolved (e.g. with preserve module). */
declare module '@angular/common/http' {
  import { Observable } from 'rxjs';
  export interface HttpHeaders {}
  export interface HttpParams {}
  export class HttpClient {
    get<T>(url: string, options?: object): Observable<T>;
    post<T>(url: string, body: unknown, options?: object): Observable<T>;
    put<T>(url: string, body: unknown, options?: object): Observable<T>;
    patch<T>(url: string, body: unknown, options?: object): Observable<T>;
    delete<T>(url: string, options?: object): Observable<T>;
  }
  export function provideHttpClient(...args: unknown[]): import('@angular/core').Provider | import('@angular/core').EnvironmentProviders;
  export function withFetch(): unknown;
}
