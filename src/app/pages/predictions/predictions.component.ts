import { Component, inject, signal } from '@angular/core';
import { ApiService, DonneesPredictions } from '../../core/services/api.service';
import { COULEURS, GraphiqueComponent, OPTIONS_AXES } from '../../shared/graphique.component';
import { KpiComponent } from '../../shared/kpi-carte.component';
import { IconeComponent } from '../../shared/icone.component';
import { FcfaPipe } from '../../shared/pipes';
import { messageErreur } from '../../core/services/erreurs';

type PeriodePrediction = 'semaine' | 'mois' | 'trimestre';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [KpiComponent, GraphiqueComponent, IconeComponent, FcfaPipe],
  templateUrl: './predictions.component.html',
})
export class PredictionsComponent {
  private api = inject(ApiService);

  periodes: { cle: PeriodePrediction; libelle: string }[] = [
    { cle: 'semaine', libelle: 'Semaine' }, { cle: 'mois', libelle: 'Mois' }, { cle: 'trimestre', libelle: 'Trimestre' },
  ];
  periode = signal<PeriodePrediction>('mois');
  d = signal<DonneesPredictions | null>(null);
  erreur = signal('');
  analyseEnCours = signal(false);
  courbe: any;
  options: any = { ...OPTIONS_AXES, plugins: { legend: { display: true, position: 'bottom' } } };

  constructor() { this.charger(); }

  charger() {
    this.api.predictions(this.periode()).subscribe({ next: (d) => this.afficher(d), error: (e) => this.erreur.set(messageErreur(e)) });
  }

  choisir(p: PeriodePrediction) { this.periode.set(p); this.charger(); }

  relancer() {
    this.analyseEnCours.set(true);
    this.api.relancerAnalyse().subscribe({
      next: (d) => { this.afficher(d); this.analyseEnCours.set(false); },
      error: (e) => { this.erreur.set(messageErreur(e)); this.analyseEnCours.set(false); },
    });
  }

  private afficher(d: DonneesPredictions) {
    this.d.set(d);
    const c = d.courbe;
    this.courbe = {
      labels: c.labels,
      datasets: [
        { label: 'Réel', data: c.reel, borderColor: COULEURS.vert, tension: 0.35, pointRadius: 0 },
        { label: 'Prévision', data: c.prevision, borderColor: COULEURS.menthe, borderDash: [6, 5], tension: 0.35, pointRadius: 0 },
        { label: 'Intervalle de confiance', data: c.max, borderColor: 'transparent', backgroundColor: 'rgba(47,191,135,.14)', fill: '+1', pointRadius: 0, tension: 0.35 },
        { label: 'min', data: c.min, borderColor: 'transparent', pointRadius: 0, tension: 0.35 },
      ],
    };
  }
}
