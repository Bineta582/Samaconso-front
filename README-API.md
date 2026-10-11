# Contrat d'API attendu côté Laravel

Base : `environment.apiUrl` (ex. `http://localhost:8000/api`). Authentification : `Authorization: Bearer <JWT>`.
Les noms de champs sont en français / snake_case ; les types TypeScript correspondants sont dans `src/app/core/models/models.ts` et `core/services/api.service.ts`.

## Routes à exposer (`routes/api.php`)

```php
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/register', [AuthController::class, 'register']);

Route::middleware('auth:api')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('accueil', [AccueilController::class, 'index']);
    Route::get('mesures/instantane', [MesureController::class, 'instantane']);   // {puissance_kw, variation}
    Route::get('tableau-de-bord', [TableauBordController::class, 'index']);      // ?periode=semaine|mois|annee
    Route::get('consommation', [ConsommationController::class, 'index']);       // ?debut&fin&equipement_id
    Route::get('consommation/export', [ConsommationController::class, 'export']); // PDF (blob)

    Route::apiResource('equipements', EquipementController::class)->except('show');
    Route::post('equipements/{equipement}/commande', [EquipementController::class, 'commande']); // relais {etat}

    Route::get('alertes', [AlerteController::class, 'index']);                   // ?filtre=toutes|non_lues
    Route::patch('alertes/{alerte}/lue', [AlerteController::class, 'lue']);
    Route::post('alertes/lues', [AlerteController::class, 'toutesLues']);
    Route::get('alertes/seuils', [SeuilController::class, 'index']);
    Route::put('alertes/seuils/{cle}', [SeuilController::class, 'update']);      // {valeur}

    Route::get('predictions', [PredictionController::class, 'index']);           // ?periode=semaine|mois|trimestre
    Route::post('predictions/relancer', [PredictionController::class, 'relancer']);

    Route::get('facturation/solde', [FacturationController::class, 'solde']);
    Route::get('facturation/transactions', [FacturationController::class, 'transactions']);
    Route::get('facturation/transactions/{id}/recu', [FacturationController::class, 'recu']); // PDF
    Route::get('facturation/moyens-paiement', [FacturationController::class, 'moyens']);
    Route::post('facturation/recharges', [FacturationController::class, 'recharger']); // {montant, moyen, numero?}

    Route::put('profil', [ProfilController::class, 'update']);
    Route::put('profil/mot-de-passe', [ProfilController::class, 'motDePasse']);  // {password_actuel, password, password_confirmation}
    Route::get('profil/notifications', [ProfilController::class, 'preferences']);
    Route::put('profil/notifications', [ProfilController::class, 'majPreferences']);
    Route::post('support/signalement', [SupportController::class, 'store']);     // {message}

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('vue-densemble', [AdminController::class, 'vueEnsemble']);    // ?periode
        Route::get('abonnes', [AdminController::class, 'abonnes']);
        Route::get('compteurs', [AdminController::class, 'compteurs']);
        Route::get('capteurs', [AdminController::class, 'capteurs']);
        Route::get('alertes', [AdminController::class, 'alertes']);
        Route::get('statistiques', [AdminController::class, 'statistiques']);
    });
});
```

## Formats clés

- **Login / register** → `{ "token": "...", "utilisateur": { id, nom, prenom, email, telephone, role: "abonne"|"admin", type_abonnement: "menage"|"petite_entreprise", numero_compteur, ... } }`
- **Register** attend : `nom, prenom, email, telephone, numero_compteur, type_abonnement, password, password_confirmation`.
- **Erreurs de validation** : le front lit le format Laravel standard `422 { message, errors: { champ: [..] } }`.
- **Jeton expiré** : toute réponse `401` (hors login/register) déconnecte l'utilisateur.
- Les formes exactes des réponses de chaque écran (`accueil`, `tableau-de-bord`, `consommation`, `predictions`, `admin/vue-densemble`…) sont les interfaces `Donnees*` de `api.service.ts` ; le fichier `core/interceptors/mock.interceptor.ts` en contient un exemple concret de chaque.

## CORS (obligatoire en développement)

Autorise `http://localhost:4200` dans `config/cors.php` (`'paths' => ['api/*']`, `'allowed_origins' => ['http://localhost:4200']`, `'allowed_headers' => ['*']`).
