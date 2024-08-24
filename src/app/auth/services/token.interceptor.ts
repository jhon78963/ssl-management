import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const excludedEndpoints: string[] = ['login'];
  const excludedEndpointsAfterRefresh: string[] = ['refresh-token', 'logout'];
  const tokenData = JSON.parse(localStorage.getItem('tokenData')!);

  if (excludedEndpoints.some(endpoint => request.url.includes(endpoint))) {
    return next(request);
  }
  if (tokenData) {
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenData.token}`,
      },
    });

    return next(clonedRequest).pipe(
      catchError(error => {
        if (
          error.status === 401 &&
          !excludedEndpointsAfterRefresh.some(endpoint =>
            request.url.includes(endpoint),
          )
        ) {
          authService.refreshToken(tokenData.refreshToken).subscribe({
            next: (response: any) => {
              const clonedRequestRepeat = request.clone({
                url: request.url,
                setHeaders: {
                  Authorization: `Bearer ${response.token}`,
                },
              });
              return next(clonedRequestRepeat);
            },
            error: () => {
              localStorage.clear();
              router.navigate(['auth']);
              return throwError(() => error);
            },
          });
        }
        return throwError(() => error);
      }),
    );
  }

  return next(request);
};
