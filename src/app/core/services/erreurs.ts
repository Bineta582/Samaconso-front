import { HttpErrorResponse } from '@angular/common/http';

/** Transforme une erreur Laravel (401, 422, 500...) en message lisible. */
export function messageErreur(err: unknown): string {
  const e = err as HttpErrorResponse;
  if (e?.status === 0) return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  const erreurs = e?.error?.errors as Record<string, string[]> | undefined;
  if (erreurs) return Object.values(erreurs).flat().join(' ');
  return e?.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
}
