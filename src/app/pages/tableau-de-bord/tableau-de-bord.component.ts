import { Component, inject, signal } from '@angular/core';
import { ApiService, DonneesTableauBord, Periode } from '../../core/services/api.service';
import { COULEURS, GraphiqueComponent, OPTIONS_AXES } from '../../shared/graphique.component';
import { KpiComponent } from '../../shared/kpi-carte.component';
import { RepartitionComponent } from '../../shared/repartition.component';
import { IconeComponent } from '../../shared/icone.component';
import { messageErreur } from '../../core/services/erreurs';

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  imports: [KpiComponent, GraphiqueComponent, RepartitionComponent, IconeComponent],
  templateUrl: './tableau-de-bord.component.html',
})
export class TableauDeBordComponent {
  private api = inject(ApiService);

  periodes: { cle: Periode; libelle: string }[] = [
    { cle: 'semaine', libelle: 'Semaine' },
    { cle: 'mois', libelle: 'Mois' },
    { cle: 'annee', libelle: 'Année' },
  ];
  periode = signal<Periode>('mois');
  d = signal<DonneesTableauBord | null>(null);
  erreur = signal('');

  evolution: any; comparaison: any; prediction: any;
  optEvolution: any = {
    ...OPTIONS_AXES,
    plugins: { legend: { display: true, position: 'bottom' } },
    scales: { ...OPTIONS_AXES.scales, y1: { position: 'right', grid: { display: false }, beginAtZero: true, ticks: { color: '#6b7570' } } },
  };
  optPrediction: any = { ...OPTIONS_AXES, plugins: { legend: { display: true, position: 'bottom' } } };
  optBarres: any = { ...OPTIONS_AXES };

  constructor() { this.charger(); }

  changerPeriode(p: Periode) { this.periode.set(p); this.charger(); }

  charger() {
    this.erreur.set('');
    this.api.tableauBord(this.periode()).subscribe({
      next: (d) => {
        this.d.set(d);
        const e = d.evolution;
        this.evolution = {
          labels: e.labels,
          datasets: [
            { label: 'kWh', data: e.energie, borderColor: COULEURS.vert, backgroundColor: 'rgba(31,78,61,.08)', fill: true, tension: 0.35, pointRadius: 2, yAxisID: 'y' },
            { label: 'Coût (FCFA)', data: e.cout ?? [], borderColor: COULEURS.jaune, tension: 0.35, pointRadius: 2, yAxisID: 'y1' },
          ],
        };
        this.comparaison = {
          labels: d.comparaison_mensuelle.map((p) => p.label),
          datasets: [{ data: d.comparaison_mensuelle.map((p) => p.valeur), borderRadius: 8,
            backgroundColor: d.comparaison_mensuelle.map((_, i, a) => (i === a.length - 1 ? COULEURS.jaune : COULEURS.vert)) }],
        };
        this.prediction = {
          labels: d.prediction.labels,
          datasets: [
            { label: 'Réel', data: d.prediction.reel, borderColor: COULEURS.vert, tension: 0.35, pointRadius: 0 },
            { label: 'Prévision', data: d.prediction.prevision, borderColor: COULEURS.menthe, borderDash: [6, 5], tension: 0.35, pointRadius: 0 },
          ],
        };
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  exporter() {
    // Export PDF côté serveur (Laravel + DomPDF) — voir README-API.md
    this.api.exporterConsommationPdf().subscribe((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'consommation-samaconso.pdf';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }
}
