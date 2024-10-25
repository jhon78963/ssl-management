import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const excludedEndpoints: string[] = ['login'];
  const excludedEndpointsAfterRefresh: string[] = ['refresh-token', 'logout'];
  const tokenData = JSON.parse(localStorage.getItem('tokenData') || '{}');

  if (excludedEndpoints.some(endpoint => request.url.includes(endpoint))) {
    return next(request);
  }

  if (tokenData && tokenData.token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenData.token}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !excludedEndpointsAfterRefresh.some(endpoint =>
          request.url.includes(endpoint),
        ) &&
        tokenData &&
        tokenData.refreshToken
      ) {
        return authService
          .refreshToken(tokenData.refreshToken, tokenData.token)
          .pipe(
            switchMap((response: any) => {
              localStorage.setItem('tokenData', JSON.stringify(response));
              const newRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.token}`,
                },
              });

              return next(newRequest);
            }),
            catchError(refreshError => {
              console.error('Error refreshing token:', refreshError);
              localStorage.clear();
              router.navigate(['auth']);
              return throwError(() => refreshError);
            }),
          );
      }
      return throwError(() => error);
    }),
  );
};
