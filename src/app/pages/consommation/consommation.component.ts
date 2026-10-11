import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, DonneesConsommation } from '../../core/services/api.service';
import { Equipement } from '../../core/models/models';
import { COULEURS, GraphiqueComponent, OPTIONS_AXES } from '../../shared/graphique.component';
import { KpiComponent } from '../../shared/kpi-carte.component';
import { IconeComponent } from '../../shared/icone.component';
import { messageErreur } from '../../core/services/erreurs';

type Grandeur = 'energie' | 'puissance' | 'tension' | 'courant';

@Component({
  selector: 'app-consommation',
  standalone: true,
  imports: [FormsModule, KpiComponent, GraphiqueComponent, IconeComponent],
  templateUrl: './consommation.component.html',
})
export class ConsommationComponent {
  private api = inject(ApiService);

  grandeurs: { cle: Grandeur; libelle: string; unite: string }[] = [
    { cle: 'energie', libelle: 'Énergie', unite: 'kWh' },
    { cle: 'puissance', libelle: 'Puissance', unite: 'kW' },
    { cle: 'tension', libelle: 'Tension', unite: 'V' },
    { cle: 'courant', libelle: 'Courant', unite: 'A' },
  ];
  grandeur = signal<Grandeur>('energie');
  debut = '2026-09-01';
  fin = '2026-09-30';
  equipementId: number | '' = '';
  equipements = signal<Equipement[]>([]);
  d = signal<DonneesConsommation | null>(null);
  erreur = signal('');
  courbe: any;
  options: any = { ...OPTIONS_AXES };
  maxBarre = 1;

  constructor() {
    this.api.equipements().subscribe({ next: (e) => this.equipements.set(e), error: () => {} });
    this.charger();
  }

  charger() {
    this.erreur.set('');
    this.api.consommation(this.debut, this.fin, this.equipementId).subscribe({
      next: (d) => { this.d.set(d); this.maxBarre = Math.max(...d.par_equipement.map((e) => e.kwh ?? 0), 1); this.majCourbe(); },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  choisirGrandeur(g: Grandeur) { this.grandeur.set(g); this.majCourbe(); }

  private majCourbe() {
    const d = this.d();
    if (!d) return;
    const g = this.grandeur();
    this.courbe = {
      labels: d.courbe.labels,
      datasets: [{ label: g, data: d.courbe[g] ?? [], borderColor: COULEURS.vert, backgroundColor: 'rgba(47,191,135,.14)', fill: true, tension: 0.35, pointRadius: 0 }],
    };
  }

  exporter() {
    this.api.exporterConsommationPdf(this.debut, this.fin).subscribe((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `consommation_${this.debut}_${this.fin}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }
}
