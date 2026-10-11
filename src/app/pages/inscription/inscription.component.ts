import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { messageErreur } from '../../core/services/erreurs';
import { TypeAbonnement } from '../../core/models/models';

const memeMotDePasse = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('password_confirmation')?.value ? null : { different: true };

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inscription.component.html',
})
export class InscriptionComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group(
    {
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^(\+221)?\s?(7[05678])[\s\d]{7,}$/)]],
      numero_compteur: ['', [Validators.required, Validators.pattern(/^SN-\d{7}$/)]],
      type_abonnement: ['menage' as TypeAbonnement, Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
    },
    { validators: memeMotDePasse },
  );
  enCours = signal(false);
  erreur = signal('');

  choisirType(t: TypeAbonnement) { this.form.controls.type_abonnement.setValue(t); }

  invalide(nom: keyof typeof this.form.controls) {
    const c = this.form.controls[nom];
    return c.touched && c.invalid;
  }

  soumettre() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.enCours.set(true);
    this.erreur.set('');
    this.auth.inscription(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/accueil'),
      error: (e) => { this.erreur.set(messageErreur(e)); this.enCours.set(false); },
    });
  }
}
