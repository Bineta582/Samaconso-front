import { TypeAlerte } from '../core/models/models';

export function classeAlerte(t: TypeAlerte): string {
  return t === 'pic_consommation' || t === 'tension_anormale' ? 'rouge' : t === 'capteur_hors_ligne' ? '' : 'vert';
}
export function iconeAlerte(t: TypeAlerte): string {
  return t === 'capteur_hors_ligne' ? 'capteurs' : t === 'tension_anormale' ? 'equipements' : t === 'pic_consommation' ? 'consommation' : 'alertes';
}
