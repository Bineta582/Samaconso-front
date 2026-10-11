export type RoleUtilisateur = 'abonne' | 'admin';
export type TypeAbonnement = 'menage' | 'petite_entreprise';

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: RoleUtilisateur;
  type_abonnement?: TypeAbonnement;
  numero_compteur?: string;
  statut_compteur?: string;
  date_installation?: string;
  adresse?: string;
}

export interface ReponseAuth {
  token: string;
  utilisateur: Utilisateur;
}

export interface InscriptionPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numero_compteur: string;
  type_abonnement: TypeAbonnement;
  password: string;
  password_confirmation: string;
}

export interface Kpi {
  libelle: string;
  valeur: string;
  detail?: string;
  tendance?: 'hausse' | 'baisse' | 'neutre';
}

export interface PointSerie {
  label: string;
  valeur: number;
}

export interface Mesure {
  date_heure: string;
  tension: number;
  courant: number;
  puissance: number;
  energie: number;
  frequence: number;
}

export interface Repartition {
  libelle: string;
  pourcentage: number;
  kwh?: number;
}

export interface Equipement {
  id: number;
  nom: string;
  piece: string;
  etat: 'marche' | 'eteint';
  puissance_nominale: number; // W
  conso_actuelle: number | null; // kW
  capteur?: string | null;
}

export type TypeAlerte =
  | 'pic_consommation'
  | 'tension_anormale'
  | 'capteur_hors_ligne'
  | 'consommation_elevee';

export interface Alerte {
  id: number;
  type: TypeAlerte;
  titre: string;
  message: string;
  source: string;
  date: string;
  lue: boolean;
}

export interface SeuilAlerte {
  cle: string;
  libelle: string;
  valeur: number;
  unite: string;
}

export interface Prediction {
  periode: string;
  modele: string;
  conso_prevue_kwh: number;
  cout_prevu_fcfa: number;
  precision: number;
}

export interface Recommandation {
  id: number;
  priorite: 'haute' | 'moyenne' | 'basse';
  titre: string;
  generee: string;
}

export interface SoldeWoyofal {
  solde_kwh: number;
  solde_fcfa: number;
  autonomie_jours: number;
  derniere_recharge_fcfa: number;
  derniere_recharge_info: string;
  depenses_mois_fcfa: number;
  nb_recharges_mois: number;
}

export type MoyenPaiement = 'Orange Money' | 'Wave' | 'Carte' | 'Free Money';

export interface Transaction {
  id: number;
  date: string;
  type: string;
  montant: number;
  moyen: string;
  statut: 'reussi' | 'echoue' | 'en_attente';
}

export interface MoyenPaiementEnregistre {
  id: number;
  libelle: string;
  detail: string;
  defaut: boolean;
}

export interface RechargePayload {
  montant: number;
  moyen: MoyenPaiement;
  numero?: string;
}

export interface PreferencesNotification {
  alertes_email: boolean;
  alertes_sms: boolean;
  rapport_hebdomadaire: boolean;
  recommandations: boolean;
}

export interface LigneAdmin {
  [cle: string]: string | number;
}
