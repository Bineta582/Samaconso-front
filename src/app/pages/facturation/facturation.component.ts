import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MoyenPaiement, MoyenPaiementEnregistre, SoldeWoyofal, Transaction } from '../../core/models/models';
import { FcfaPipe } from '../../shared/pipes';
import { messageErreur } from '../../core/services/erreurs';

@Component({
  selector: 'app-facturation',
  standalone: true,
  imports: [FormsModule, FcfaPipe],
  templateUrl: './facturation.component.html',
})
export class FacturationComponent {
  private api = inject(ApiService);
  auth = inject(AuthService);

  montantsRapides = [1000, 2000, 5000, 10000];
  moyens: MoyenPaiement[] = ['Orange Money', 'Wave', 'Carte', 'Free Money'];

  solde = signal<SoldeWoyofal | null>(null);
  transactions = signal<Transaction[]>([]);
  moyensEnregistres = signal<MoyenPaiementEnregistre[]>([]);
  montant = 2000;
  montantPerso: number | null = null;
  moyen: MoyenPaiement = 'Orange Money';
  numero = this.auth.utilisateur()?.telephone ?? '';
  enCours = signal(false);
  erreur = signal('');
  succes = signal('');

  constructor() {
    this.charger();
    this.api.moyensPaiement().subscribe({ next: (m) => this.moyensEnregistres.set(m), error: () => {} });
  }

  charger() {
    this.api.solde().subscribe({ next: (s) => this.solde.set(s), error: (e) => this.erreur.set(messageErreur(e)) });
    this.api.transactions().subscribe({ next: (t) => this.transactions.set(t), error: () => {} });
  }

  get montantFinal(): number { return this.montantPerso && this.montantPerso > 0 ? this.montantPerso : this.montant; }

  choisirMontant(m: number) { this.montant = m; this.montantPerso = null; }

  recharger() {
    if (this.montantFinal < 500) { this.erreur.set('Le montant minimum est de 500 FCFA.'); return; }
    this.enCours.set(true); this.erreur.set(''); this.succes.set('');
    this.api.recharger({ montant: this.montantFinal, moyen: this.moyen, numero: this.moyen === 'Carte' ? undefined : this.numero }).subscribe({
      next: (r) => {
        this.enCours.set(false);
        this.succes.set(r.code_woyofal ? `Recharge réussie. Code Woyofal à saisir sur votre compteur : ${r.code_woyofal}` : 'Recharge réussie.');
        this.charger();
      },
      error: (e) => { this.enCours.set(false); this.erreur.set(messageErreur(e)); },
    });
  }

  recu(t: Transaction) {
    this.api.recuTransaction(t.id).subscribe((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `recu-${t.id}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  libelleStatut(s: Transaction['statut']) { return s === 'reussi' ? 'Réussi' : s === 'echoue' ? 'Échoué' : 'En attente'; }
  classeStatut(s: Transaction['statut']) { return s === 'reussi' ? 'ok' : s === 'echoue' ? 'ko' : 'warn'; }
}
