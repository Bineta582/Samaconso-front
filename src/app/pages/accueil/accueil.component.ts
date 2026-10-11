import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap, timer } from 'rxjs';
import { ApiService, DonneesAccueil } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';
import { COULEURS, GraphiqueComponent, OPTIONS_AXES } from '../../shared/graphique.component';
import { IconeComponent } from '../../shared/icone.component';
import { KpiComponent } from '../../shared/kpi-carte.component';
import { RepartitionComponent } from '../../shared/repartition.component';
import { classeAlerte, iconeAlerte } from '../../shared/alertes.util';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [RouterLink, KpiComponent, GraphiqueComponent, RepartitionComponent, IconeComponent],
  templateUrl: './accueil.component.html',
})
export class AccueilComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  d = signal<DonneesAccueil | null>(null);
  erreur = signal(false);
  puissance = signal<{ kw: number; variation: number } | null>(null);
  courbe: any = null;
  options = { ...OPTIONS_AXES };
  Math = Math;
  classeAlerte = classeAlerte;
  iconeAlerte = iconeAlerte;

  constructor() {
    this.api.accueil().pipe(takeUntilDestroyed()).subscribe({
      next: (d) => {
        this.d.set(d);
        this.courbe = {
          labels: d.serie_24h.map((p) => p.label),
          datasets: [{ data: d.serie_24h.map((p) => p.valeur), borderColor: COULEURS.vert, backgroundColor: 'rgba(47,191,135,.15)', fill: true, tension: 0.4, pointRadius: 0 }],
        };
      },
      error: () => this.erreur.set(true),
    });

    // Temps réel : la puissance instantanée est rafraîchie toutes les 5 secondes (cf. mémoire).
    timer(0, environment.intervalleTempsReelMs)
      .pipe(switchMap(() => this.api.puissanceInstantanee()), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (p) => this.puissance.set({ kw: p.puissance_kw, variation: p.variation }), error: () => {} });
  }
}
