import { Routes } from '@angular/router';
import { adminGuard, authGuard, inviteGuard } from './core/guards/auth.guards';

/**
 * Une page = une route (URL propre), chargée à la demande (lazy loading).
 *
 *   /  (présentation)  /connexion  /inscription      → pages publiques
 *   /accueil  /tableau-de-bord  /equipements         → espace abonné
 *   /consommation  /facturation  /alertes
 *   /predictions  /parametres
 *   /admin/vue-densemble  /admin/abonnes ...         → espace administrateur
 */
export const routes: Routes = [
  // ----- Page de présentation (publique) : « / » -----
  {
    path: '',
    pathMatch: 'full',
    canActivate: [inviteGuard], // un utilisateur déjà connecté est renvoyé vers /accueil
    title: 'SamaConso — Votre énergie, sous contrôle',
    loadComponent: () => import('./pages/presentation/presentation.component').then((m) => m.PresentationComponent),
  },

  // ----- Pages publiques -----
  {
    path: '',
    canActivate: [inviteGuard],
    loadComponent: () => import('./layouts/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      { path: 'connexion', title: 'Connexion — SamaConso', loadComponent: () => import('./pages/connexion/connexion.component').then((m) => m.ConnexionComponent) },
      { path: 'inscription', title: 'Inscription — SamaConso', loadComponent: () => import('./pages/inscription/inscription.component').then((m) => m.InscriptionComponent) },
    ],
  },

  // ----- Espace abonné -----
  {
    path: '',
    canActivate: [authGuard],
    data: { espace: 'abonne' },
    loadComponent: () => import('./layouts/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: 'accueil', title: 'Accueil — SamaConso', data: { titre: 'Accueil' }, loadComponent: () => import('./pages/accueil/accueil.component').then((m) => m.AccueilComponent) },
      { path: 'tableau-de-bord', title: 'Tableau de bord — SamaConso', data: { titre: 'Tableau de bord' }, loadComponent: () => import('./pages/tableau-de-bord/tableau-de-bord.component').then((m) => m.TableauDeBordComponent) },
      { path: 'equipements', title: 'Équipements — SamaConso', data: { titre: 'Équipements' }, loadComponent: () => import('./pages/equipements/equipements.component').then((m) => m.EquipementsComponent) },
      { path: 'consommation', title: 'Consommation — SamaConso', data: { titre: 'Consommation' }, loadComponent: () => import('./pages/consommation/consommation.component').then((m) => m.ConsommationComponent) },
      { path: 'facturation', title: 'Facturation — SamaConso', data: { titre: 'Facturation' }, loadComponent: () => import('./pages/facturation/facturation.component').then((m) => m.FacturationComponent) },
      { path: 'alertes', title: 'Alertes — SamaConso', data: { titre: 'Alertes' }, loadComponent: () => import('./pages/alertes/alertes.component').then((m) => m.AlertesComponent) },
      { path: 'predictions', title: 'Prédictions — SamaConso', data: { titre: 'Prédictions' }, loadComponent: () => import('./pages/predictions/predictions.component').then((m) => m.PredictionsComponent) },
      { path: 'parametres', title: 'Paramètres — SamaConso', data: { titre: 'Paramètres' }, loadComponent: () => import('./pages/parametres/parametres.component').then((m) => m.ParametresComponent) },
    ],
  },

  // ----- Espace administrateur -----
  {
    path: 'admin',
    canActivate: [adminGuard],
    data: { espace: 'admin' },
    loadComponent: () => import('./layouts/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'vue-densemble' },
      { path: 'vue-densemble', title: "Vue d'ensemble — Admin", data: { titre: "Vue d'ensemble" }, loadComponent: () => import('./pages/admin/vue-densemble/vue-densemble.component').then((m) => m.VueDensembleComponent) },
      { path: 'abonnes', title: 'Abonnés — Admin', data: { titre: 'Abonnés', ressource: 'abonnes' }, loadComponent: () => import('./pages/admin/liste-admin/liste-admin.component').then((m) => m.ListeAdminComponent) },
      { path: 'compteurs', title: 'Compteurs — Admin', data: { titre: 'Compteurs', ressource: 'compteurs' }, loadComponent: () => import('./pages/admin/liste-admin/liste-admin.component').then((m) => m.ListeAdminComponent) },
      { path: 'capteurs', title: 'Capteurs — Admin', data: { titre: 'Capteurs', ressource: 'capteurs' }, loadComponent: () => import('./pages/admin/liste-admin/liste-admin.component').then((m) => m.ListeAdminComponent) },
      { path: 'alertes', title: 'Alertes — Admin', data: { titre: 'Alertes', ressource: 'alertes' }, loadComponent: () => import('./pages/admin/liste-admin/liste-admin.component').then((m) => m.ListeAdminComponent) },
      { path: 'statistiques', title: 'Statistiques — Admin', data: { titre: 'Statistiques' }, loadComponent: () => import('./pages/admin/statistiques/statistiques.component').then((m) => m.StatistiquesComponent) },
      { path: 'parametres', title: 'Paramètres — Admin', data: { titre: 'Paramètres' }, loadComponent: () => import('./pages/parametres/parametres.component').then((m) => m.ParametresComponent) },
    ],
  },

  { path: '**', redirectTo: 'accueil' },
];
