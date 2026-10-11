import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Kpi } from '../../../core/models/models';
import { COULEURS, GraphiqueComponent, OPTIONS_AXES } from '../../../shared/graphique.component';
import { KpiComponent } from '../../../shared/kpi-carte.component';
import { messageErreur } from '../../../core/services/erreurs';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [KpiComponent, GraphiqueComponent],
  template: `
    <div class="page">
      <div class="entete-page"><div><h1>Statistiques du réseau</h1><p>Indicateurs agrégés de tous les abonnés SamaConso.</p></div></div>
      @if (erreur()) { <div class="alerte-form erreur-bloc">{{ erreur() }}</div> }
      <div class="grille-kpi">@for (k of kpis(); track k.libelle) { <app-kpi [kpi]="k" /> }</div>
      <div class="grille-main">
        <div class="carte"><div class="carte-tete"><h2>Consommation mensuelle (MWh)</h2></div>
          <div class="chart-box">@if (mensuel) { <app-graphique type="bar" [donnees]="mensuel" [options]="options" /> }</div></div>
        <div class="carte"><div class="carte-tete"><h2>Consommation par zone (MWh)</h2></div>
          <div class="chart-box">@if (zones) { <app-graphique type="bar" [donnees]="zones" [options]="options" /> }</div></div>
      </div>
    </div>`,
})
export class StatistiquesComponent {
  private api = inject(ApiService);
  kpis = signal<Kpi[]>([]);
  erreur = signal('');
  mensuel: any; zones: any;
  options: any = { ...OPTIONS_AXES };

  constructor() {
    this.api.adminStatistiques().subscribe({
      next: (s) => {
        this.kpis.set(s.kpis);
        this.mensuel = { labels: s.mensuel.map((p) => p.label), datasets: [{ data: s.mensuel.map((p) => p.valeur), backgroundColor: COULEURS.vert, borderRadius: 8 }] };
        this.zones = { labels: s.par_zone.map((p) => p.label), datasets: [{ data: s.par_zone.map((p) => p.valeur), backgroundColor: COULEURS.menthe, borderRadius: 8 }] };
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }
}
