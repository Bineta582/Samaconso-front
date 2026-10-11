import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { IconeComponent } from '../shared/icone.component';

interface LienMenu { chemin: string; libelle: string; icone: string; }

const MENU_ABONNE: LienMenu[] = [
  { chemin: '/accueil', libelle: 'Accueil', icone: 'accueil' },
  { chemin: '/tableau-de-bord', libelle: 'Tableau de bord', icone: 'tableau' },
  { chemin: '/equipements', libelle: 'Équipements', icone: 'equipements' },
  { chemin: '/consommation', libelle: 'Consommation', icone: 'consommation' },
  { chemin: '/facturation', libelle: 'Facturation', icone: 'facturation' },
  { chemin: '/alertes', libelle: 'Alertes', icone: 'alertes' },
  { chemin: '/predictions', libelle: 'Prédictions', icone: 'predictions' },
  { chemin: '/parametres', libelle: 'Paramètres', icone: 'parametres' },
];

const MENU_ADMIN: LienMenu[] = [
  { chemin: '/admin/vue-densemble', libelle: "Vue d'ensemble", icone: 'tableau' },
  { chemin: '/admin/abonnes', libelle: 'Abonnés', icone: 'abonnes' },
  { chemin: '/admin/compteurs', libelle: 'Compteurs', icone: 'compteurs' },
  { chemin: '/admin/capteurs', libelle: 'Capteurs', icone: 'capteurs' },
  { chemin: '/admin/alertes', libelle: 'Alertes', icone: 'alertes' },
  { chemin: '/admin/statistiques', libelle: 'Statistiques', icone: 'statistiques' },
  { chemin: '/admin/parametres', libelle: 'Paramètres', icone: 'parametres' },
];

/** Coque commune (menu latéral + barre haute) — espace abonné ET espace administrateur. */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconeComponent],
  template: `
    <div class="shell">
      <aside class="menu-lateral">
        <div class="logo"><i>⚡</i> SamaConso</div>
        @if (admin) { <div class="espace">ESPACE ADMINISTRATEUR</div> }
        <nav>
          @for (l of menu; track l.chemin) {
            <a [routerLink]="l.chemin" routerLinkActive="actif"><app-icone [nom]="l.icone" />{{ l.libelle }}</a>
          }
        </nav>
        <div class="utilisateur">
          <span class="avatar">{{ auth.initiales() }}</span>
          <div>
            <b>{{ auth.utilisateur()?.prenom }} {{ auth.utilisateur()?.nom }}</b>
            <small>{{ admin ? 'Administrateur' : 'Abonné · ' + (auth.utilisateur()?.type_abonnement === 'petite_entreprise' ? 'Petite entreprise' : 'Ménage') }}</small>
          </div>
          <button class="quitter" title="Se déconnecter" (click)="auth.deconnexion()"><app-icone nom="quitter" /></button>
        </div>
      </aside>
      <div class="contenu">
        <header class="barre-haute">
          <span class="titre-page">{{ titre() }}</span>
          <label class="recherche">
            <app-icone nom="recherche" [taille]="16" />
            <input type="search" [placeholder]="admin ? 'Rechercher un abonné, un compteur...' : 'Rechercher un équipement, une alerte...'" />
          </label>
          <a class="avatar" [routerLink]="admin ? '/admin/parametres' : '/parametres'">{{ auth.initiales() }}</a>
        </header>
        <router-outlet />
      </div>
    </div>`,
})
export class ShellComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  admin = this.route.snapshot.data['espace'] === 'admin';
  menu = this.admin ? MENU_ADMIN : MENU_ABONNE;
  titre = signal(this.titreCourant());

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.titre.set(this.titreCourant()));
  }

  private titreCourant(): string {
    let r = this.route.snapshot;
    while (r.firstChild) r = r.firstChild;
    return r.data['titre'] ?? '';
  }
}
