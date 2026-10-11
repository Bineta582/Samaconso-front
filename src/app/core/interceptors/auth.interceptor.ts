import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Ajoute le JWT à chaque requête et déconnecte l'utilisateur si le jeton a expiré (401). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const requete = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
    : req.clone({ setHeaders: { Accept: 'application/json' } });

  return next(requete).pipe(
    catchError((err: HttpErrorResponse) => {
      const estAuth = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (err.status === 401 && !estAuth) auth.deconnexion(false);
      return throwError(() => err);
    }),
  );
};
