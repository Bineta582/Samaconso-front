import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Simule l'API Laravel avec les données des maquettes (environment.useMock = true).
 * Permet de développer et de présenter le front sans backend.
 * Comptes de test : n'importe quel email/mot de passe — un email contenant « admin » ouvre l'espace administrateur.
 */

const jours = (n: number) => Array.from({ length: n }, (_, i) => String(i + 1));
const onde = (n: number, base: number, amp: number, phase = 0) =>
  Array.from({ length: n }, (_, i) => +(base + amp * Math.sin((i + phase) / 3.2) + (i % 4) * amp * 0.08).toFixed(2));

let equipements: any[] = [
  { id: 1, nom: 'Climatiseur salon', piece: 'Salon', etat: 'marche', puissance_nominale: 1500, conso_actuelle: 1.2, capteur: 'PZEM-004T #12' },
  { id: 2, nom: 'Réfrigérateur', piece: 'Cuisine', etat: 'marche', puissance_nominale: 350, conso_actuelle: 0.28, capteur: 'SCT-013 #04' },
  { id: 3, nom: 'Four électrique', piece: 'Cuisine', etat: 'eteint', puissance_nominale: 2000, conso_actuelle: 0, capteur: 'PZEM-004T #07' },
  { id: 4, nom: 'Machine à laver', piece: 'Buanderie', etat: 'eteint', puissance_nominale: 800, conso_actuelle: 0, capteur: 'SCT-013 #09' },
  { id: 5, nom: 'Éclairage LED', piece: 'Ensemble du logement', etat: 'marche', puissance_nominale: 120, conso_actuelle: 0.09, capteur: 'PZEM-004T #02' },
  { id: 6, nom: 'Chauffe-eau', piece: 'Salle de bain', etat: 'eteint', puissance_nominale: 1800, conso_actuelle: null, capteur: null },
];
let alertes: any[] = [
  { id: 1, type: 'pic_consommation', titre: 'Pic de consommation', message: 'Le Four électrique a dépassé le seuil de 1800 W (mesuré : 2040 W).', source: 'Compteur SN-0245871', date: '30/09, 14:12', lue: false },
  { id: 2, type: 'tension_anormale', titre: 'Tension anormale', message: 'Tension mesurée à 245 V sur le circuit cuisine (seuil : 240 V).', source: 'Compteur SN-0245871', date: '29/09, 21:40', lue: false },
  { id: 3, type: 'capteur_hors_ligne', titre: 'Capteur hors ligne', message: 'Le capteur SCT-013 #07 ne répond plus depuis 2 heures.', source: 'Machine à laver', date: '29/09, 18:05', lue: true },
  { id: 4, type: 'consommation_elevee', titre: 'Consommation élevée', message: "Consommation journalière proche de l'objectif mensuel (300 kWh).", source: 'Compteur SN-0245871', date: '28/09, 09:00', lue: true },
  { id: 5, type: 'pic_consommation', titre: 'Pic de consommation', message: 'Le Climatiseur a dépassé le seuil de 1400 W (mesuré : 1512 W).', source: 'Compteur SN-0245871', date: '27/09, 15:30', lue: true },
];
let seuils: any[] = [
  { cle: 'puissance_max', libelle: 'Puissance instantanée max.', valeur: 1800, unite: 'W' },
  { cle: 'tension_max', libelle: 'Tension maximale', valeur: 240, unite: 'V' },
  { cle: 'tension_min', libelle: 'Tension minimale', valeur: 210, unite: 'V' },
  { cle: 'conso_jour_max', libelle: 'Consommation journalière max.', valeur: 10, unite: 'kWh' },
];
let transactions: any[] = [
  { id: 1, date: '30/09 — 14:12', type: 'Recharge', montant: 5000, moyen: 'Orange Money', statut: 'reussi' },
  { id: 2, date: '28/09 — 09:00', type: 'Recharge', montant: 2000, moyen: 'Wave', statut: 'reussi' },
  { id: 3, date: '20/09 — 18:30', type: 'Recharge', montant: 10000, moyen: 'Visa •••• 4242', statut: 'reussi' },
  { id: 4, date: '12/09 — 08:15', type: 'Recharge', montant: 1000, moyen: 'Orange Money', statut: 'echoue' },
  { id: 5, date: '05/09 — 11:45', type: 'Recharge', montant: 5000, moyen: 'Wave', statut: 'reussi' },
];
let prefs = { alertes_email: true, alertes_sms: false, rapport_hebdomadaire: true, recommandations: true };
let soldeKwh = 42;

const repartition = [
  { libelle: 'Climatiseur', pourcentage: 42, kwh: 112 }, { libelle: 'Réfrigérateur', pourcentage: 18, kwh: 48 },
  { libelle: 'Four électrique', pourcentage: 15, kwh: 40 }, { libelle: 'Autres équipements', pourcentage: 25, kwh: 68 },
];
const recommandations = [
  { id: 1, priorite: 'haute', titre: "Décaler l'usage du four", generee: "Générée aujourd'hui" },
  { id: 2, priorite: 'moyenne', titre: 'Optimiser le climatiseur', generee: 'Générée hier' },
];
const utilisateurAbonne = { id: 1, nom: 'Diop', prenom: 'Awa', email: 'awa.diop@email.com', telephone: '+221 77 000 00 00', role: 'abonne', type_abonnement: 'menage', numero_compteur: 'SN-0245871', statut_compteur: 'Actif', date_installation: '12 mars 2025', adresse: 'Dakar, Sénégal' };
const utilisateurAdmin = { id: 2, nom: 'Ndiaye', prenom: 'Moussa', email: 'admin@samaconso.sn', telephone: '+221 77 111 22 33', role: 'admin' };

function predictionCourbe() {
  const n = 30;
  const reel = Array.from({ length: n }, (_, i) => (i < 18 ? +(8 + Math.sin(i / 3) * 1.8 + (i % 3) * 0.2).toFixed(1) : null));
  const prevision = Array.from({ length: n }, (_, i) => (i >= 17 ? +(9.2 + Math.sin(i / 3) * 1.2).toFixed(1) : null));
  return { labels: jours(n), reel, prevision, min: prevision.map((v) => (v === null ? null : +(v - 1.4).toFixed(1))), max: prevision.map((v) => (v === null ? null : +(v + 1.4).toFixed(1))) };
}

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);
  const chemin = req.url.replace(environment.apiUrl, '').split('?')[0];
  const m = req.method;
  const body: any = req.body ?? {};
  const rep = (corps: unknown, status = 200) => of(new HttpResponse({ status, body: corps })).pipe(delay(250));

  // ----- Authentification -----
  if (chemin === '/auth/login' && m === 'POST') {
    const admin = String(body.email).toLowerCase().includes('admin');
    return rep({ token: 'jeton-mock', utilisateur: admin ? utilisateurAdmin : { ...utilisateurAbonne, email: body.email } });
  }
  if (chemin === '/auth/register' && m === 'POST') {
    return rep({ token: 'jeton-mock', utilisateur: { ...utilisateurAbonne, ...body, id: 3, role: 'abonne', statut_compteur: 'Actif' } });
  }
  if (chemin === '/auth/logout') return rep({});

  // ----- Accueil / tableau de bord -----
  if (chemin === '/accueil') {
    return rep({
      nom_affiche: 'Awa', date_label: 'vendredi 4 septembre',
      kpis: [
        { libelle: 'Consommation du jour', valeur: '8.6 kWh', detail: '▼ 2% vs hier', tendance: 'baisse' },
        { libelle: 'Coût estimé (aujourd\'hui)', valeur: '3 250 FCFA', detail: 'Basé sur le tarif Woyofal' },
        { libelle: 'Statut du système', valeur: 'Aucune alerte', detail: 'Dernière vérification il y a 2 min' },
      ],
      serie_24h: Array.from({ length: 24 }, (_, h) => ({ label: `${String(h).padStart(2, '0')}h`, valeur: +(0.6 + 0.5 * Math.sin(h / 3.5) + (h > 17 && h < 22 ? 0.7 : 0)).toFixed(2) })),
      alertes_recentes: [
        { id: 1, type: 'pic_consommation', titre: 'Pic de consommation — Four électrique', message: '', source: '', date: 'Il y a 3 heures', lue: false },
        { id: 2, type: 'tension_anormale', titre: 'Tension anormale — Circuit cuisine', message: '', source: '', date: 'Hier, 21:40', lue: false },
      ],
      repartition,
    });
  }
  if (chemin === '/mesures/instantane') return rep({ puissance_kw: +(1.24 + (Math.random() - 0.5) * 0.12).toFixed(2), variation: 4 });
  if (chemin === '/tableau-de-bord') {
    const p = new URL(req.urlWithParams).searchParams.get('periode') ?? 'mois';
    const n = p === 'semaine' ? 7 : p === 'annee' ? 12 : 30;
    const labels = p === 'annee' ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'] : jours(n);
    const energie = onde(n, p === 'annee' ? 260 : 9, p === 'annee' ? 30 : 2);
    return rep({
      compteur: 'SN-0245871',
      kpis: [
        { libelle: 'Consommation (mois)', valeur: '268 kWh', detail: '▲ 8% vs mois dernier', tendance: 'hausse' },
        { libelle: 'Coût total (mois)', valeur: '98 500 FCFA', detail: 'Tarification Woyofal' },
        { libelle: 'Économie réalisée', valeur: '-12%', detail: 'Par rapport à votre objectif', tendance: 'baisse' },
        { libelle: 'Prédiction fin de mois', valeur: '≈ 310 kWh', detail: 'Soit ≈ 114 000 FCFA estimés' },
      ],
      evolution: { labels, energie, cout: energie.map((e) => Math.round(e * 368)) },
      comparaison_mensuelle: [{ label: 'Avr', valeur: 220 }, { label: 'Mai', valeur: 245 }, { label: 'Juin', valeur: 260 }, { label: 'Juil', valeur: 290 }, { label: 'Août', valeur: 275 }, { label: 'Sept*', valeur: 180 }],
      repartition, total_kwh: 268,
      prediction: { labels: jours(30), reel: predictionCourbe().reel, prevision: predictionCourbe().prevision },
      recommandations,
    });
  }

  // ----- Consommation -----
  if (chemin === '/consommation/export') return rep(new Blob(['Export PDF simulé'], { type: 'application/pdf' }));
  if (chemin === '/consommation') {
    return rep({
      kpis: [
        { libelle: 'Énergie consommée', valeur: '268 kWh', detail: 'Sur la période sélectionnée' },
        { libelle: 'Puissance moyenne', valeur: '1.05 kW', detail: 'Calculée sur les mesures' },
        { libelle: 'Tension moyenne', valeur: '229.8 V', detail: 'Nominale : 230 V' },
        { libelle: 'Fréquence moyenne', valeur: '50.1 Hz', detail: 'Stable sur la période' },
      ],
      courbe: { labels: jours(30), energie: onde(30, 9, 2), puissance: onde(30, 1.05, 0.3), tension: onde(30, 230, 2.5), courant: onde(30, 4.8, 0.9) },
      mesures: [
        ['30/09 — 14:00', 231.2, 5.4, 1248, 0.31, 50.1], ['30/09 — 13:45', 229.8, 4.8, 1103, 0.28, 50.0], ['30/09 — 13:30', 230.5, 5.1, 1176, 0.29, 50.1],
        ['30/09 — 13:15', 228.9, 4.6, 1053, 0.26, 49.9], ['30/09 — 13:00', 230.1, 5.0, 1150, 0.29, 50.0], ['30/09 — 12:45', 229.4, 4.7, 1078, 0.27, 50.1],
      ].map(([date_heure, tension, courant, puissance, energie, frequence]) => ({ date_heure, tension, courant, puissance, energie, frequence })),
      par_equipement: [
        { libelle: 'Climatiseur salon', pourcentage: 42, kwh: 112 }, { libelle: 'Réfrigérateur', pourcentage: 18, kwh: 48 }, { libelle: 'Four électrique', pourcentage: 15, kwh: 40 },
        { libelle: 'Machine à laver', pourcentage: 9, kwh: 24 }, { libelle: 'Éclairage LED', pourcentage: 7, kwh: 18 }, { libelle: 'Chauffe-eau', pourcentage: 9, kwh: 26 },
      ],
    });
  }

  // ----- Équipements -----
  let r = chemin.match(/^\/equipements\/(\d+)\/commande$/);
  if (r && m === 'POST') {
    equipements = equipements.map((e) => (e.id === +r![1] ? { ...e, etat: body.etat, conso_actuelle: body.etat === 'marche' ? +(e.puissance_nominale * 0.0008).toFixed(2) : 0 } : e));
    return rep(equipements.find((e) => e.id === +r![1]));
  }
  r = chemin.match(/^\/equipements\/(\d+)$/);
  if (r && m === 'DELETE') { equipements = equipements.filter((e) => e.id !== +r![1]); return rep({}); }
  if (chemin === '/equipements' && m === 'POST') { const e = { ...body, id: Date.now() }; equipements = [...equipements, e]; return rep(e, 201); }
  if (chemin === '/equipements') return rep(equipements);

  // ----- Alertes -----
  if (chemin === '/alertes/seuils') return rep(seuils);
  r = chemin.match(/^\/alertes\/seuils\/(\w+)$/);
  if (r && m === 'PUT') { seuils = seuils.map((s) => (s.cle === r![1] ? { ...s, valeur: body.valeur } : s)); return rep(seuils.find((s) => s.cle === r![1])); }
  if (chemin === '/alertes/lues') { alertes = alertes.map((a) => ({ ...a, lue: true })); return rep({}); }
  r = chemin.match(/^\/alertes\/(\d+)\/lue$/);
  if (r) { alertes = alertes.map((a) => (a.id === +r![1] ? { ...a, lue: true } : a)); return rep({}); }
  if (chemin === '/alertes') {
    const nonLues = new URL(req.urlWithParams).searchParams.get('filtre') === 'non_lues';
    return rep({
      kpis: [
        { libelle: 'Alertes non lues', valeur: String(alertes.filter((a) => !a.lue).length), detail: 'À consulter' },
        { libelle: 'Alertes cette semaine', valeur: '5', detail: 'Toutes catégories confondues' },
        { libelle: 'Type le plus fréquent', valeur: 'Pic de conso.', detail: '2 occurrences ce mois' },
        { libelle: 'Seuils configurés', valeur: String(seuils.length), detail: 'Personnalisables ci-contre' },
      ],
      alertes: nonLues ? alertes.filter((a) => !a.lue) : alertes,
    });
  }

  // ----- Prédictions -----
  if (chemin === '/predictions' || chemin === '/predictions/relancer') {
    return rep({
      kpis: [
        { libelle: 'Prévision fin de mois', valeur: '≈ 310 kWh', detail: '▲ 8% vs mois dernier', tendance: 'hausse' },
        { libelle: 'Coût prévu (fin de mois)', valeur: '≈ 114 000 FCFA', detail: 'Tarification Woyofal' },
        { libelle: 'Précision du modèle', valeur: '92%', detail: 'Sur les 6 derniers mois' },
        { libelle: 'Dernière analyse', valeur: chemin.endsWith('relancer') ? "À l'instant" : 'Il y a 3h', detail: 'Nouvelle analyse chaque nuit' },
      ],
      courbe: predictionCourbe(),
      detail: [
        { periode: 'Semaine prochaine', modele: 'Random Forest Regressor', conso_prevue_kwh: 62, cout_prevu_fcfa: 26000, precision: 94 },
        { periode: 'Mois en cours (reste)', modele: 'Random Forest Regressor', conso_prevue_kwh: 310, cout_prevu_fcfa: 114000, precision: 92 },
        { periode: 'Mois prochain', modele: 'Random Forest Regressor', conso_prevue_kwh: 325, cout_prevu_fcfa: 120000, precision: 88 },
        { periode: 'Trimestre (3 mois)', modele: 'Random Forest Regressor', conso_prevue_kwh: 945, cout_prevu_fcfa: 349000, precision: 85 },
      ],
      recommandations,
    });
  }

  // ----- Facturation -----
  if (chemin === '/facturation/solde') {
    return rep({ solde_kwh: soldeKwh, solde_fcfa: Math.round(soldeKwh * 369), autonomie_jours: Math.max(1, Math.round(soldeKwh / 7)), derniere_recharge_fcfa: transactions[0].montant, derniere_recharge_info: `${transactions[0].date.split(' ')[0]} · ${transactions[0].moyen}`, depenses_mois_fcfa: 23000, nb_recharges_mois: 4 });
  }
  if (chemin === '/facturation/transactions') return rep(transactions);
  if (/^\/facturation\/transactions\/\d+\/recu$/.test(chemin)) return rep(new Blob(['Reçu simulé'], { type: 'application/pdf' }));
  if (chemin === '/facturation/moyens-paiement') return rep([{ id: 1, libelle: 'Orange Money', detail: '•••• 1234', defaut: true }, { id: 2, libelle: 'Visa', detail: '•••• 4242 · Exp. 08/28', defaut: false }]);
  if (chemin === '/facturation/recharges' && m === 'POST') {
    soldeKwh += Math.round(body.montant / 369);
    const t = { id: Date.now(), date: 'À l\'instant', type: 'Recharge', montant: body.montant, moyen: body.moyen, statut: 'reussi' };
    transactions = [t, ...transactions];
    return rep({ transaction: t, code_woyofal: Array.from({ length: 5 }, () => String(1000 + Math.floor(Math.random() * 9000))).join(' ') }, 201);
  }

  // ----- Profil -----
  if (chemin === '/profil' && m === 'PUT') return rep({ ...utilisateurAbonne, ...body });
  if (chemin === '/profil/mot-de-passe') return rep({});
  if (chemin === '/profil/notifications') { if (m === 'PUT') prefs = body; return rep(prefs); }
  if (chemin === '/support/signalement') return rep({}, 201);

  // ----- Administration -----
  if (chemin === '/admin/vue-densemble') {
    return rep({
      kpis: [
        { libelle: 'Abonnés actifs', valeur: '1 284', detail: '▲ 36 nouveaux ce mois', tendance: 'baisse' },
        { libelle: 'Compteurs connectés', valeur: '1 302', detail: '96% du parc en ligne' },
        { libelle: 'Capteurs actifs', valeur: '3 512', detail: '98% de disponibilité' },
        { libelle: 'Alertes non traitées', valeur: '7', detail: 'dont 2 critiques', tendance: 'hausse' },
      ],
      conso_reseau: jours(30).map((j, i) => ({ label: j, valeur: +(38 + 6 * Math.sin(i / 3.5) + i * 0.15).toFixed(1) })),
      abonnes_recents: [
        { initiales: 'AD', nom: 'Awa Diop', email: 'awa.diop@email.com', compteur: 'SN-0245871', conso: '268 kWh', statut: 'Actif' },
        { initiales: 'MS', nom: 'Mamadou Sow', email: 'mamadou.sow@email.com', compteur: 'SN-0198234', conso: '412 kWh', statut: 'Alerte' },
        { initiales: 'FN', nom: 'Fatou Ndiaye', email: 'fatou.ndiaye@email.com', compteur: 'SN-0312456', conso: '156 kWh', statut: 'Actif' },
        { initiales: 'OB', nom: 'Ousmane Ba', email: 'ousmane.ba@email.com', compteur: 'SN-0287612', conso: '89 kWh', statut: 'Maintenance' },
        { initiales: 'KD', nom: 'Khady Diallo', email: 'khady.diallo@email.com', compteur: 'SN-0356789', conso: '203 kWh', statut: 'Actif' },
      ],
      etat_capteurs: [
        { libelle: 'ESP32 (microcontrôleurs)', actifs: 1340, total: 1350 }, { libelle: 'PZEM-004T (puissance)', actifs: 1298, total: 1350 },
        { libelle: 'SCT-013 (courant)', actifs: 1254, total: 1350 }, { libelle: 'Relais connectés', actifs: 1320, total: 1350 },
      ],
      alertes_globales: [
        { titre: 'Surtension — Compteur SN-0198234', detail: 'Mamadou Sow · il y a 40 min', critique: true },
        { titre: 'Capteur hors ligne — SCT-013 #4821', detail: 'Zone Parcelles Assainies · il y a 2h', critique: false },
      ],
      repartition_abonnes: [{ libelle: 'Ménage', pourcentage: 72 }, { libelle: 'Petite entreprise', pourcentage: 28 }],
      compteurs_par_statut: [{ libelle: 'Actif', valeur: 1302 }, { libelle: 'En maintenance', valeur: 32 }, { libelle: 'Hors ligne', valeur: 16 }],
      derniere_synchro: 'Dernière synchronisation du parc : il y a 5 minutes.',
    });
  }
  if (chemin === '/admin/abonnes') return rep([
    { nom: 'Awa Diop', email: 'awa.diop@email.com', compteur: 'SN-0245871', type: 'Ménage', conso: '268 kWh', statut: 'Actif' },
    { nom: 'Mamadou Sow', email: 'mamadou.sow@email.com', compteur: 'SN-0198234', type: 'Petite entreprise', conso: '412 kWh', statut: 'Alerte' },
    { nom: 'Fatou Ndiaye', email: 'fatou.ndiaye@email.com', compteur: 'SN-0312456', type: 'Ménage', conso: '156 kWh', statut: 'Actif' },
    { nom: 'Ousmane Ba', email: 'ousmane.ba@email.com', compteur: 'SN-0287612', type: 'Ménage', conso: '89 kWh', statut: 'Maintenance' },
    { nom: 'Khady Diallo', email: 'khady.diallo@email.com', compteur: 'SN-0356789', type: 'Petite entreprise', conso: '203 kWh', statut: 'Actif' },
  ]);
  if (chemin === '/admin/compteurs') return rep([
    { compteur: 'SN-0245871', abonne: 'Awa Diop', zone: 'Dakar Plateau', installation: '12/03/2025', statut: 'Actif' },
    { compteur: 'SN-0198234', abonne: 'Mamadou Sow', zone: 'Parcelles Assainies', installation: '04/11/2024', statut: 'Alerte' },
    { compteur: 'SN-0287612', abonne: 'Ousmane Ba', zone: 'Pikine', installation: '21/01/2025', statut: 'Maintenance' },
    { compteur: 'SN-0399001', abonne: '—', zone: 'Guédiawaye', installation: '02/08/2025', statut: 'Hors ligne' },
  ]);
  if (chemin === '/admin/capteurs') return rep([
    { capteur: 'ESP32 #0012', type: 'Microcontrôleur', compteur: 'SN-0245871', derniere_mesure: 'il y a 5 s', etat: 'En ligne' },
    { capteur: 'PZEM-004T #12', type: 'Puissance', compteur: 'SN-0245871', derniere_mesure: 'il y a 5 s', etat: 'En ligne' },
    { capteur: 'SCT-013 #4821', type: 'Courant', compteur: 'SN-0356789', derniere_mesure: 'il y a 2 h', etat: 'Hors ligne' },
    { capteur: 'Relais #0045', type: 'Relais', compteur: 'SN-0198234', derniere_mesure: 'il y a 12 s', etat: 'En ligne' },
  ]);
  if (chemin === '/admin/alertes') return rep([
    { alerte: 'Surtension', compteur: 'SN-0198234', abonne: 'Mamadou Sow', date: '30/09 — 13:20', gravite: 'Critique' },
    { alerte: 'Capteur hors ligne', compteur: 'SN-0356789', abonne: 'Khady Diallo', date: '30/09 — 12:05', gravite: 'Alerte' },
  ]);
  if (chemin === '/admin/statistiques') return rep({
    kpis: [{ libelle: 'Consommation du réseau', valeur: '1 148 MWh', detail: 'Septembre' }, { libelle: 'Consommation moyenne / abonné', valeur: '894 kWh', detail: 'Sur le mois' },
      { libelle: 'Anomalies détectées', valeur: '312', detail: '▼ 9% vs mois dernier' }, { libelle: 'Précision moyenne ML', valeur: '90%', detail: 'Random Forest' }],
    mensuel: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'].map((label, i) => ({ label, valeur: 900 + i * 48 })),
    par_zone: [{ label: 'Plateau', valeur: 310 }, { label: 'Parcelles', valeur: 270 }, { label: 'Pikine', valeur: 240 }, { label: 'Guédiawaye', valeur: 190 }, { label: 'Rufisque', valeur: 138 }],
  });

  return rep({ message: 'Route mock non définie : ' + chemin }, 404);
};
