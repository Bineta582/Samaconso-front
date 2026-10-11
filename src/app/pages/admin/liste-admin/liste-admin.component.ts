import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { LigneAdmin } from '../../../core/models/models';
import { messageErreur } from '../../../core/services/erreurs';

type Ressource = 'abonnes' | 'compteurs' | 'capteurs' | 'alertes';

/** Page générique (tableau + recherche) pour /admin/abonnes, /compteurs, /capteurs, /alertes. */
@Component({
  selector: 'app-liste-admin',
  standalone: true,
  templateUrl: './liste-admin.component.html',
})
export class ListeAdminComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  titre = this.route.snapshot.data['titre'] as string;
  ressource = this.route.snapshot.data['ressource'] as Ressource;
  lignes = signal<LigneAdmin[]>([]);
  recherche = signal('');
  erreur = signal('');
  chargement = signal(true);

  colonnes = computed(() => (this.lignes()[0] ? Object.keys(this.lignes()[0]) : []));
  filtrees = computed(() => {
    const q = this.recherche().toLowerCase().trim();
    return q ? this.lignes().filter((l) => Object.values(l).some((v) => String(v).toLowerCase().includes(q))) : this.lignes();
  });

  constructor() {
    this.api.adminListe(this.ressource).subscribe({
      next: (l) => { this.lignes.set(l); this.chargement.set(false); },
      error: (e) => { this.erreur.set(messageErreur(e)); this.chargement.set(false); },
    });
  }

  entete(cle: string) { return cle.replace(/_/g, ' '); }
  classe(v: string | number) {
    const s = String(v);
    return s === 'Actif' || s === 'En ligne' ? 'ok' : s === 'Alerte' || s === 'Hors ligne' || s === 'Critique' ? 'ko' : s === 'Maintenance' ? 'warn' : '';
  }
  estStatut(cle: string) { return cle === 'statut' || cle === 'etat' || cle === 'gravite'; }
}
