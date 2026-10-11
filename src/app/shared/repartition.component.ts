import { Component, Input } from '@angular/core';
import { Repartition } from '../core/models/models';
import { COULEURS, GraphiqueComponent } from './graphique.component';

/** Donut + légende « Répartition par équipement / des abonnés ». */
@Component({
  selector: 'app-repartition',
  standalone: true,
  imports: [GraphiqueComponent],
  template: `
    <div class="chart-box donut">
      <app-graphique type="doughnut" [donnees]="donnees" [options]="optionsDonut" />
    </div>
    <ul class="legende">
      @for (r of lignes; track r.libelle; let i = $index) {
        <li><span class="pt" [style.background]="palette[i % palette.length]"></span>{{ r.libelle }}<b>{{ r.pourcentage }}%</b></li>
      }
    </ul>`,
})
export class RepartitionComponent {
  palette = COULEURS.palette;
  optionsDonut: any = { cutout: '68%' };
  lignes: Repartition[] = [];
  donnees: any = { labels: [], datasets: [] };
  @Input() set repartition(v: Repartition[]) {
    this.lignes = v ?? [];
    this.donnees = {
      labels: this.lignes.map((r) => r.libelle),
      datasets: [{ data: this.lignes.map((r) => r.pourcentage), backgroundColor: this.palette, borderWidth: 0 }],
    };
  }
}
