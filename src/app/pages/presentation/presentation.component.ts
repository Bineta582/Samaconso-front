import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Page publique de présentation : route « / », affichée avant connexion / inscription. */
@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss',
})
export class PresentationComponent {
  fonctionnalites = [
    { titre: 'Suivi en temps réel', texte: 'Puissance, tension, courant et énergie actualisés toutes les 5 secondes, par équipement et par circuit.' },
    { titre: 'Coût et crédit Woyofal', texte: "Estimation automatique de vos dépenses selon la grille tarifaire SENELEC, durée de vie du crédit et alertes de recharge." },
    { titre: 'Équipements énergivores', texte: 'Identifiez les appareils qui pèsent le plus sur votre facture et ciblez le gaspillage.' },
    { titre: 'Alertes intelligentes', texte: 'Pics de consommation, tensions anormales, capteurs hors ligne : soyez prévenu par notification ou SMS.' },
    { titre: 'Prédictions', texte: 'Prévision à 7 et 30 jours grâce à un modèle Random Forest, avec coût estimé et indice de fiabilité.' },
    { titre: 'Recommandations', texte: 'Des conseils personnalisés, classés par impact financier, pour consommer moins et mieux.' },
  ];
  etapes = [
    { n: 1, titre: 'Mesure', texte: 'Un boîtier ESP32 avec capteurs PZEM-004T et SCT-013 mesure votre consommation.' },
    { n: 2, titre: 'Transmission', texte: 'Les mesures partent en MQTT, chiffrées en TLS, vers le serveur.' },
    { n: 3, titre: 'Analyse', texte: "Le backend Laravel enregistre, détecte les anomalies et le modèle prédit l'avenir." },
    { n: 4, titre: 'Visualisation', texte: 'Vous suivez tout depuis votre navigateur, sur ordinateur comme sur mobile.' },
  ];
  public = [
    { titre: 'Ménages', texte: 'Comprenez pourquoi votre crédit Woyofal part plus vite que prévu.' },
    { titre: 'Petites entreprises', texte: 'Maîtrisez vos charges électriques et repérez les dérives.' },
  ];
  annee = new Date().getFullYear();

  aller(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
}
