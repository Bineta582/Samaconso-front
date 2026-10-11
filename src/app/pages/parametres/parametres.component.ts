import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PreferencesNotification, TypeAbonnement } from '../../core/models/models';
import { messageErreur } from '../../core/services/erreurs';

const memeMotDePasse = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('password_confirmation')?.value ? null : { different: true };

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './parametres.component.html',
})
export class ParametresComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  u = this.auth.utilisateur();

  profil = this.fb.nonNullable.group({
    nom: [this.u?.nom ?? '', Validators.required],
    prenom: [this.u?.prenom ?? '', Validators.required],
    email: [this.u?.email ?? '', [Validators.required, Validators.email]],
    telephone: [this.u?.telephone ?? '', Validators.required],
    type_abonnement: [(this.u?.type_abonnement ?? 'menage') as TypeAbonnement],
  });
  securite = this.fb.nonNullable.group(
    { password_actuel: ['', Validators.required], password: ['', [Validators.required, Validators.minLength(8)]], password_confirmation: ['', Validators.required] },
    { validators: memeMotDePasse },
  );
  prefs = signal<PreferencesNotification>({ alertes_email: true, alertes_sms: false, rapport_hebdomadaire: true, recommandations: true });
  libellesPrefs: { cle: keyof PreferencesNotification; libelle: string }[] = [
    { cle: 'alertes_email', libelle: 'Alertes par email' },
    { cle: 'alertes_sms', libelle: 'Alertes par SMS' },
    { cle: 'rapport_hebdomadaire', libelle: 'Rapport hebdomadaire' },
    { cle: 'recommandations', libelle: 'Recommandations personnalisées' },
  ];
  message = signal<{ type: 'ok' | 'ko'; texte: string } | null>(null);

  constructor() {
    this.api.preferences().subscribe({ next: (p) => this.prefs.set(p), error: () => {} });
  }

  private notifier(type: 'ok' | 'ko', texte: string) { this.message.set({ type, texte }); }

  choisirType(t: TypeAbonnement) { this.profil.controls.type_abonnement.setValue(t); }

  enregistrerProfil() {
    if (this.profil.invalid) { this.profil.markAllAsTouched(); return; }
    this.api.modifierProfil(this.profil.getRawValue()).subscribe({
      next: (u) => { this.auth.majUtilisateur({ ...this.auth.utilisateur()!, ...u }); this.notifier('ok', 'Informations enregistrées.'); },
      error: (e) => this.notifier('ko', messageErreur(e)),
    });
  }

  changerMotDePasse() {
    if (this.securite.invalid) { this.securite.markAllAsTouched(); return; }
    this.api.changerMotDePasse(this.securite.getRawValue()).subscribe({
      next: () => { this.securite.reset(); this.notifier('ok', 'Mot de passe modifié.'); },
      error: (e) => this.notifier('ko', messageErreur(e)),
    });
  }

  basculerPref(cle: keyof PreferencesNotification, valeur: boolean) {
    const maj = { ...this.prefs(), [cle]: valeur };
    this.prefs.set(maj);
    this.api.modifierPreferences(maj).subscribe({ error: (e) => this.notifier('ko', messageErreur(e)) });
  }

  signaler() {
    const msg = prompt('Décrivez le problème rencontré :');
    if (!msg?.trim()) return;
    this.api.signalerProbleme(msg).subscribe({
      next: () => this.notifier('ok', 'Signalement envoyé. Merci !'),
      error: (e) => this.notifier('ko', messageErreur(e)),
    });
  }
}
