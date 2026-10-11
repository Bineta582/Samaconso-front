import { Component, Input } from '@angular/core';

const CHEMINS: Record<string, string> = {
  accueil: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  tableau: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  equipements: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  consommation: 'M22 12h-4l-3 9L9 3l-3 9H2',
  facturation: 'M1 4h22v16H1z M1 10h22',
  alertes: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  predictions: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
  parametres: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  abonnes: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  compteurs: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 12l4-4',
  capteurs: 'M4 4h16v16H4z M9 9h6v6H9z M9 1v3 M15 1v3 M9 20v3 M15 20v3 M20 9h3 M20 14h3 M1 9h3 M1 14h3',
  statistiques: 'M12 20V10 M18 20V4 M6 20v-4',
  quitter: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  recherche: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  telecharger: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  plus: 'M12 5v14 M5 12h14',
  check: 'M20 6L9 17l-5-5',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
  corbeille: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6',
};

@Component({
  selector: 'app-icone',
  standalone: true,
  template: `<svg [attr.width]="taille" [attr.height]="taille" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path [attr.d]="chemin" /></svg>`,
  styles: [':host{display:inline-flex}'],
})
export class IconeComponent {
  @Input() nom = 'accueil';
  @Input() taille = 20;
  get chemin() { return CHEMINS[this.nom] ?? ''; }
}
