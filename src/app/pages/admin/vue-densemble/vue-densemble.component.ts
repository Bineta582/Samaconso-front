import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, DonneesAdmin, Periode } from '../../../core/services/api.service';
import { COULEURS, GraphiqueComponent, OPTIONS_AXES } from '../../../shared/graphique.component';
import { KpiComponent } from '../../../shared/kpi-carte.component';
import { RepartitionComponent } from '../../../shared/repartition.component';
import { IconeComponent } from '../../../shared/icone.component';
import { messageErreur } from '../../../core/services/erreurs';

@Component({
  selector: 'app-vue-densemble',
  standalone: true,
  imports: [RouterLink, KpiComponent, GraphiqueComponent, RepartitionComponent, IconeComponent],
  templateUrl: './vue-densemble.component.html',
})
export class VueDensembleComponent {
  private api = inject(ApiService);

  periodes: { cle: Periode; libelle: string }[] = [
    { cle: 'semaine', libelle: 'Semaine' }, { cle: 'mois', libelle: 'Mois' }, { cle: 'annee', libelle: 'Année' },
  ];
  periode = signal<Periode>('mois');
  d = signal<DonneesAdmin | null>(null);
  erreur = signal('');
  courbe: any;
  options: any = { ...OPTIONS_AXES };

  constructor() { this.charger(); }

  choisir(p: Periode) { this.periode.set(p); this.charger(); }

  charger() {
    this.api.adminVueEnsemble(this.periode()).subscribe({
      next: (d) => {
        this.d.set(d);
        this.courbe = {
          labels: d.conso_reseau.map((p) => p.label),
          datasets: [{ data: d.conso_reseau.map((p) => p.valeur), borderColor: COULEURS.vert, backgroundColor: 'rgba(47,191,135,.15)', fill: true, tension: 0.35, pointRadius: 0 }],
        };
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  classeStatut(s: string) { return s === 'Actif' ? 'ok' : s === 'Alerte' ? 'ko' : 'warn'; }
  pct(a: number, t: number) { return Math.round((a / t) * 100); }
}
