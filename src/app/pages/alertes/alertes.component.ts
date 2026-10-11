import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Alerte, Kpi, SeuilAlerte } from '../../core/models/models';
import { KpiComponent } from '../../shared/kpi-carte.component';
import { IconeComponent } from '../../shared/icone.component';
import { classeAlerte, iconeAlerte } from '../../shared/alertes.util';
import { messageErreur } from '../../core/services/erreurs';

@Component({
  selector: 'app-alertes',
  standalone: true,
  imports: [KpiComponent, IconeComponent],
  templateUrl: './alertes.component.html',
})
export class AlertesComponent {
  private api = inject(ApiService);

  filtre = signal<'toutes' | 'non_lues'>('toutes');
  kpis = signal<Kpi[]>([]);
  alertes = signal<Alerte[]>([]);
  seuils = signal<SeuilAlerte[]>([]);
  erreur = signal('');
  classeAlerte = classeAlerte;
  iconeAlerte = iconeAlerte;

  constructor() {
    this.charger();
    this.api.seuils().subscribe({ next: (s) => this.seuils.set(s), error: (e) => this.erreur.set(messageErreur(e)) });
  }

  charger() {
    this.api.alertes(this.filtre()).subscribe({
      next: (r) => { this.kpis.set(r.kpis); this.alertes.set(r.alertes); },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  choisirFiltre(f: 'toutes' | 'non_lues') { this.filtre.set(f); this.charger(); }

  lue(a: Alerte) {
    this.api.marquerAlerteLue(a.id).subscribe(() => {
      this.alertes.update((l) => l.map((x) => (x.id === a.id ? { ...x, lue: true } : x)));
    });
  }

  toutesLues() { this.api.marquerToutesLues().subscribe(() => this.charger()); }

  modifierSeuil(s: SeuilAlerte) {
    const saisie = prompt(`${s.libelle} (${s.unite})`, String(s.valeur));
    const valeur = saisie === null ? NaN : Number(saisie.replace(',', '.'));
    if (Number.isNaN(valeur) || valeur <= 0) return;
    this.api.modifierSeuil(s.cle, valeur).subscribe({
      next: (maj) => this.seuils.update((l) => l.map((x) => (x.cle === s.cle ? maj : x))),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }
}
