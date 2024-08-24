import { Injectable } from '@angular/core';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { Login, LoginResponse, Token, User } from '../interfaces';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
  ) {}

  private setAuthentication(token: Token): boolean {
    localStorage.setItem('tokenData', JSON.stringify(token));
    return true;
  }

  private setUserData(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  login(body: Login): Observable<User> {
    return this.apiService.post<LoginResponse>('auth/login', body).pipe(
      tap((token: Token) => this.setAuthentication(token)),
      switchMap(() => this.me()),
      tap((user: User) => {
        this.setUserData(user);
        this.router.navigateByUrl('/');
      }),
      catchError(err => {
        return throwError(() => err.error.message);
      }),
    );
  }

  me(): Observable<User> {
    return this.apiService.post('auth/me', {});
  }

  logout() {
    return this.apiService.post('auth/logout', {});
  }

  refreshToken(refreshToken: string | null): Observable<boolean> {
    return this.apiService
      .post<LoginResponse>('auth/refresh-token', { refreshToken })
      .pipe(
        map((token: Token) => this.setAuthentication(token)),
        catchError(err => throwError(() => err.error.message)),
      );
  }
}
