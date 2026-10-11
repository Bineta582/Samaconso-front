import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Coque des pages publiques : /connexion et /inscription. */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth">
      <aside class="auth-visuel">
        <div class="logo"><i>⚡</i> SamaConso</div>
        <div>
          <h1>Votre énergie,<br /><span>sous contrôle.</span></h1>
          <p>Suivez en temps réel la consommation de votre foyer ou de votre entreprise, anticipez vos recharges Woyofal et réduisez votre facture.</p>
        </div>
        <div class="apercu">
          <small>Consommation — 24 dernières heures</small>
          <div class="apercu-chiffres">
            <div><span>Puissance instantanée</span><b>1.24 kW</b></div>
            <div><span>Coût estimé aujourd'hui</span><b>3 250 FCFA</b></div>
          </div>
        </div>
      </aside>
      <main class="auth-formulaire"><div class="auth-boite"><router-outlet /></div></main>
    </div>`,
  styles: [`
    .auth { display: grid; grid-template-columns: 1.05fr 1fr; min-height: 100vh; }
    .auth-visuel { background: var(--vert-fonce); color: var(--menthe); padding: 48px 56px; display: flex; flex-direction: column; justify-content: space-between; gap: 32px; }
    .logo { display: flex; align-items: center; gap: 10px; color: #fff; font: 800 22px Manrope; }
    .logo i { width: 34px; height: 34px; border-radius: 10px; background: var(--jaune); display: grid; place-items: center; font-style: normal; }
    h1 { color: #fff; font-size: 44px; line-height: 1.1; margin-bottom: 18px; }
    h1 span { color: var(--jaune); }
    p { max-width: 440px; line-height: 1.6; }
    .apercu { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 18px; padding: 20px 22px; }
    .apercu small { color: #7fa096; }
    .apercu-chiffres { display: flex; gap: 40px; margin-top: 14px; }
    .apercu-chiffres span { display: block; font-size: 12px; color: #7fa096; }
    .apercu-chiffres b { color: #fff; font: 800 24px Manrope; }
    .auth-formulaire { display: grid; place-items: center; padding: 32px; }
    .auth-boite { width: 100%; max-width: 440px; }
    @media (max-width: 900px) { .auth { grid-template-columns: 1fr; } .auth-visuel { display: none; } }
  `],
})
export class AuthLayoutComponent {}
