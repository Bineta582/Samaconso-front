# SamaConso — Front Angular 17

Front web du mémoire « Système intelligent de suivi et d'analyse de la consommation électrique (IoT) — abonnés SENELEC ».
Angular 17 (standalone + lazy loading par route), Chart.js, JWT, API REST Laravel.

## Démarrage

```bash
npm install
npm start            # http://localhost:4200  (mode développement)
```

Dans `src/environments/environment.development.ts` :

| Option | Rôle |
|---|---|
| `apiUrl` | URL de ton API Laravel (`php artisan serve` → `http://localhost:8000/api`) |
| `useMock` | `true` = données fictives tirées des maquettes (aucun backend). **Mets `false` pour te connecter à Laravel.** |

Comptes en mode mock : n'importe quel email / mot de passe. Un email contenant `admin` ouvre l'espace administrateur.

## Routes (une page = une URL)

| URL | Page | Accès |
|---|---|---|
| `/connexion` | Connexion | public |
| `/inscription` | Inscription | public |
| `/accueil` | Accueil (temps réel 5 s) | abonné |
| `/tableau-de-bord` | Tableau de bord | abonné |
| `/equipements` | Équipements | abonné |
| `/consommation` | Consommation détaillée | abonné |
| `/facturation` | Facturation & recharge Woyofal | abonné |
| `/alertes` | Alertes et seuils | abonné |
| `/predictions` | Prédictions et recommandations | abonné |
| `/parametres` | Paramètres | abonné |
| `/admin/vue-densemble` | Supervision de la plateforme | admin |
| `/admin/abonnes` `/compteurs` `/capteurs` `/alertes` | Listes d'administration | admin |
| `/admin/statistiques` | Statistiques du réseau | admin |
| `/admin/parametres` | Paramètres | admin |

Les routes sont déclarées dans `src/app/app.routes.ts` ; les gardes (`authGuard`, `adminGuard`, `inviteGuard`) sont dans `core/guards`.

## Structure

```
src/app
├─ core/            modèles, ApiService (tous les appels Laravel), AuthService, gardes, intercepteurs (JWT + mock)
├─ layouts/         auth-layout (connexion/inscription) et shell (menu + barre haute, abonné et admin)
├─ shared/          graphique Chart.js, KPI, donut de répartition, icônes, pipe FCFA
└─ pages/           une page = un dossier (composant + template)
```

Contrat d'API attendu côté Laravel : voir **README-API.md**.
