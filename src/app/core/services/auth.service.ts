import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InscriptionPayload, ReponseAuth, Utilisateur } from '../models/models';

const CLE_TOKEN = 'samaconso_token';
const CLE_USER = 'samaconso_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl;

  private _utilisateur = signal<Utilisateur | null>(this.lireUtilisateur());
  readonly utilisateur = this._utilisateur.asReadonly();
  readonly estConnecte = computed(() => !!this._utilisateur() && !!this.token);
  readonly estAdmin = computed(() => this._utilisateur()?.role === 'admin');
  readonly initiales = computed(() => {
    const u = this._utilisateur();
    return u ? (u.prenom[0] + u.nom[0]).toUpperCase() : '';
  });

  get token(): string | null {
    return localStorage.getItem(CLE_TOKEN);
  }

  connexion(email: string, password: string, rester: boolean): Observable<ReponseAuth> {
    return this.http
      .post<ReponseAuth>(`${this.api}/auth/login`, { email, password, remember: rester })
      .pipe(tap((r) => this.sauvegarder(r)));
  }

  inscription(payload: InscriptionPayload): Observable<ReponseAuth> {
    return this.http
      .post<ReponseAuth>(`${this.api}/auth/register`, payload)
      .pipe(tap((r) => this.sauvegarder(r)));
  }

  majUtilisateur(u: Utilisateur) {
    localStorage.setItem(CLE_USER, JSON.stringify(u));
    this._utilisateur.set(u);
  }

  deconnexion(appelerApi = true) {
    if (appelerApi && this.token) {
      this.http.post(`${this.api}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    localStorage.removeItem(CLE_TOKEN);
    localStorage.removeItem(CLE_USER);
    this._utilisateur.set(null);
    this.router.navigate(['/connexion']);
  }

  private sauvegarder(r: ReponseAuth) {
    localStorage.setItem(CLE_TOKEN, r.token);
    this.majUtilisateur(r.utilisateur);
  }

  private lireUtilisateur(): Utilisateur | null {
    try {
      const brut = localStorage.getItem(CLE_USER);
      return brut ? (JSON.parse(brut) as Utilisateur) : null;
    } catch {
      return null;
    }
  }
}
