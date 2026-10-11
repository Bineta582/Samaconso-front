import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Réservé aux utilisateurs connectés. */
export const authGuard: CanActivateFn = (_r, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estConnecte()
    ? true
    : router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

/** Réservé à l'administrateur de la plateforme. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.estConnecte()) return router.createUrlTree(['/connexion']);
  return auth.estAdmin() ? true : router.createUrlTree(['/accueil']);
};

/** Pages publiques (connexion / inscription) : redirige si déjà connecté. */
export const inviteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.estConnecte()) return true;
  return router.createUrlTree([auth.estAdmin() ? '/admin/vue-densemble' : '/accueil']);
};
