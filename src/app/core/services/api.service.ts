import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Alerte, Equipement, Kpi, LigneAdmin, Mesure, MoyenPaiementEnregistre, PointSerie,
  Prediction, PreferencesNotification, Recommandation, RechargePayload, Repartition,
  SeuilAlerte, SoldeWoyofal, Transaction, Utilisateur,
} from '../models/models';

export type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

export interface SerieConso {
  labels: string[];
  energie: number[];
  cout?: number[];
  puissance?: number[];
  tension?: number[];
  courant?: number[];
}

export interface DonneesAccueil {
  nom_affiche: string;
  date_label: string;
  kpis: Kpi[];
  serie_24h: PointSerie[];
  alertes_recentes: Alerte[];
  repartition: Repartition[];
}

export interface DonneesTableauBord {
  compteur: string;
  kpis: Kpi[];
  evolution: SerieConso;
  comparaison_mensuelle: PointSerie[];
  repartition: Repartition[];
  total_kwh: number;
  prediction: { labels: string[]; reel: (number | null)[]; prevision: (number | null)[] };
  recommandations: Recommandation[];
}

export interface DonneesConsommation {
  kpis: Kpi[];
  courbe: SerieConso;
  mesures: Mesure[];
  par_equipement: Repartition[];
}

export interface DonneesPredictions {
  kpis: Kpi[];
  courbe: { labels: string[]; reel: (number | null)[]; prevision: (number | null)[]; min: (number | null)[]; max: (number | null)[] };
  detail: Prediction[];
  recommandations: Recommandation[];
}

export interface DonneesAdmin {
  kpis: Kpi[];
  conso_reseau: PointSerie[];
  abonnes_recents: { initiales: string; nom: string; email: string; compteur: string; conso: string; statut: string }[];
  etat_capteurs: { libelle: string; actifs: number; total: number }[];
  alertes_globales: { titre: string; detail: string; critique: boolean }[];
  repartition_abonnes: Repartition[];
  compteurs_par_statut: { libelle: string; valeur: number }[];
  derniere_synchro: string;
}

/**
 * Point d'entrée unique vers l'API Laravel.
 * Chaque méthode correspond à une route de routes/api.php (voir README-API.md).
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  private params(obj: Record<string, string | number | undefined>): HttpParams {
    let p = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p = p.set(k, String(v));
    });
    return p;
  }

  // ---------- Accueil / Tableau de bord ----------
  accueil(): Observable<DonneesAccueil> {
    return this.http.get<DonneesAccueil>(`${this.url}/accueil`);
  }
  tableauBord(periode: Periode, mois?: string): Observable<DonneesTableauBord> {
    return this.http.get<DonneesTableauBord>(`${this.url}/tableau-de-bord`, {
      params: this.params({ periode, mois }),
    });
  }
  /** Temps réel (rafraîchi toutes les 5 s côté composant). */
  puissanceInstantanee(): Observable<{ puissance_kw: number; variation: number }> {
    return this.http.get<{ puissance_kw: number; variation: number }>(`${this.url}/mesures/instantane`);
  }

  // ---------- Consommation ----------
  consommation(debut?: string, fin?: string, equipementId?: number | ''): Observable<DonneesConsommation> {
    return this.http.get<DonneesConsommation>(`${this.url}/consommation`, {
      params: this.params({ debut, fin, equipement_id: equipementId }),
    });
  }
  exporterConsommationPdf(debut?: string, fin?: string): Observable<Blob> {
    return this.http.get(`${this.url}/consommation/export`, {
      params: this.params({ debut, fin, format: 'pdf' }),
      responseType: 'blob',
    });
  }

  // ---------- Équipements ----------
  equipements(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.url}/equipements`);
  }
  creerEquipement(e: Partial<Equipement>): Observable<Equipement> {
    return this.http.post<Equipement>(`${this.url}/equipements`, e);
  }
  modifierEquipement(id: number, e: Partial<Equipement>): Observable<Equipement> {
    return this.http.put<Equipement>(`${this.url}/equipements/${id}`, e);
  }
  supprimerEquipement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/equipements/${id}`);
  }
  commanderEquipement(id: number, etat: 'marche' | 'eteint'): Observable<Equipement> {
    return this.http.post<Equipement>(`${this.url}/equipements/${id}/commande`, { etat }); // relais
  }

  // ---------- Alertes ----------
  alertes(filtre: 'toutes' | 'non_lues' = 'toutes'): Observable<{ kpis: Kpi[]; alertes: Alerte[] }> {
    return this.http.get<{ kpis: Kpi[]; alertes: Alerte[] }>(`${this.url}/alertes`, { params: this.params({ filtre }) });
  }
  marquerAlerteLue(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/alertes/${id}/lue`, {});
  }
  marquerToutesLues(): Observable<void> {
    return this.http.post<void>(`${this.url}/alertes/lues`, {});
  }
  seuils(): Observable<SeuilAlerte[]> {
    return this.http.get<SeuilAlerte[]>(`${this.url}/alertes/seuils`);
  }
  modifierSeuil(cle: string, valeur: number): Observable<SeuilAlerte> {
    return this.http.put<SeuilAlerte>(`${this.url}/alertes/seuils/${cle}`, { valeur });
  }

  // ---------- Prédictions ----------
  predictions(periode: 'semaine' | 'mois' | 'trimestre'): Observable<DonneesPredictions> {
    return this.http.get<DonneesPredictions>(`${this.url}/predictions`, { params: this.params({ periode }) });
  }
  relancerAnalyse(): Observable<DonneesPredictions> {
    return this.http.post<DonneesPredictions>(`${this.url}/predictions/relancer`, {});
  }

  // ---------- Facturation / Woyofal ----------
  solde(): Observable<SoldeWoyofal> {
    return this.http.get<SoldeWoyofal>(`${this.url}/facturation/solde`);
  }
  transactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.url}/facturation/transactions`);
  }
  recharger(p: RechargePayload): Observable<{ transaction: Transaction; code_woyofal?: string }> {
    return this.http.post<{ transaction: Transaction; code_woyofal?: string }>(`${this.url}/facturation/recharges`, p);
  }
  recuTransaction(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/facturation/transactions/${id}/recu`, { responseType: 'blob' });
  }
  moyensPaiement(): Observable<MoyenPaiementEnregistre[]> {
    return this.http.get<MoyenPaiementEnregistre[]>(`${this.url}/facturation/moyens-paiement`);
  }

  // ---------- Paramètres ----------
  modifierProfil(u: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.url}/profil`, u);
  }
  changerMotDePasse(p: { password_actuel: string; password: string; password_confirmation: string }): Observable<void> {
    return this.http.put<void>(`${this.url}/profil/mot-de-passe`, p);
  }
  preferences(): Observable<PreferencesNotification> {
    return this.http.get<PreferencesNotification>(`${this.url}/profil/notifications`);
  }
  modifierPreferences(p: PreferencesNotification): Observable<PreferencesNotification> {
    return this.http.put<PreferencesNotification>(`${this.url}/profil/notifications`, p);
  }
  signalerProbleme(message: string): Observable<void> {
    return this.http.post<void>(`${this.url}/support/signalement`, { message });
  }

  // ---------- Administration ----------
  adminVueEnsemble(periode: Periode): Observable<DonneesAdmin> {
    return this.http.get<DonneesAdmin>(`${this.url}/admin/vue-densemble`, { params: this.params({ periode }) });
  }
  adminListe(ressource: 'abonnes' | 'compteurs' | 'capteurs' | 'alertes'): Observable<LigneAdmin[]> {
    return this.http.get<LigneAdmin[]>(`${this.url}/admin/${ressource}`);
  }
  adminStatistiques(): Observable<{ kpis: Kpi[]; mensuel: PointSerie[]; par_zone: PointSerie[] }> {
    return this.http.get<{ kpis: Kpi[]; mensuel: PointSerie[]; par_zone: PointSerie[] }>(`${this.url}/admin/statistiques`);
  }
}
