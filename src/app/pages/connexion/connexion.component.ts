import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { messageErreur } from '../../core/services/erreurs';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './connexion.component.html',
})
export class ConnexionComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rester: [false],
  });
  enCours = signal(false);
  erreur = signal('');
  info = signal('');

  soumettre() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password, rester } = this.form.getRawValue();
    this.enCours.set(true);
    this.erreur.set('');
    this.auth.connexion(email, password, rester).subscribe({
      next: (r) => {
        const retour = this.route.snapshot.queryParamMap.get('retour');
        this.router.navigateByUrl(retour ?? (r.utilisateur.role === 'admin' ? '/admin/vue-densemble' : '/accueil'));
      },
      error: (e) => { this.erreur.set(messageErreur(e)); this.enCours.set(false); },
    });
  }

  motDePasseOublie() {
    this.info.set("Pour réinitialiser votre mot de passe, contactez le support SENELEC ou utilisez la route /auth/mot-de-passe-oublie de l'API.");
  }
}
