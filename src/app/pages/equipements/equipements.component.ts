import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Equipement } from '../../core/models/models';
import { IconeComponent } from '../../shared/icone.component';
import { messageErreur } from '../../core/services/erreurs';

@Component({
  selector: 'app-equipements',
  standalone: true,
  imports: [ReactiveFormsModule, IconeComponent],
  templateUrl: './equipements.component.html',
})
export class EquipementsComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  equipements = signal<Equipement[]>([]);
  chargement = signal(true);
  erreur = signal('');
  formulaireOuvert = signal(false);
  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    piece: ['', Validators.required],
    puissance_nominale: [0, [Validators.required, Validators.min(1)]],
  });

  // Indicateurs calculés à partir de la liste
  total = computed(() => this.equipements().length);
  pieces = computed(() => new Set(this.equipements().map((e) => e.piece)).size);
  puissanceInstallee = computed(() => this.equipements().reduce((s, e) => s + e.puissance_nominale, 0) / 1000);
  avecCapteur = computed(() => this.equipements().filter((e) => !!e.capteur).length);
  sansCapteur = computed(() => this.total() - this.avecCapteur());
  plusEnergivore = computed<Equipement | undefined>(() => [...this.equipements()].sort((a, b) => (b.conso_actuelle ?? 0) - (a.conso_actuelle ?? 0)).at(0));
  top = computed(() => [...this.equipements()].sort((a, b) => b.puissance_nominale - a.puissance_nominale).slice(0, 4));

  constructor() { this.charger(); }

  charger() {
    this.api.equipements().subscribe({
      next: (e) => { this.equipements.set(e); this.chargement.set(false); },
      error: (e) => { this.erreur.set(messageErreur(e)); this.chargement.set(false); },
    });
  }

  ajouter() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.api.creerEquipement({ ...this.form.getRawValue(), etat: 'eteint', conso_actuelle: null, capteur: null }).subscribe({
      next: (e) => { this.equipements.update((l) => [...l, e]); this.form.reset(); this.formulaireOuvert.set(false); },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  basculer(e: Equipement) {
    const etat = e.etat === 'marche' ? 'eteint' : 'marche';
    this.api.commanderEquipement(e.id, etat).subscribe({
      next: (maj) => this.equipements.update((l) => l.map((x) => (x.id === e.id ? maj : x))),
      error: (err) => this.erreur.set(messageErreur(err)),
    });
  }

  supprimer(e: Equipement) {
    if (!confirm(`Supprimer « ${e.nom} » ?`)) return;
    this.api.supprimerEquipement(e.id).subscribe({
      next: () => this.equipements.update((l) => l.filter((x) => x.id !== e.id)),
      error: (err) => this.erreur.set(messageErreur(err)),
    });
  }
}
