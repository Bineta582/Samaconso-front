import { Pipe, PipeTransform } from '@angular/core';

/** 98500 → "98 500 FCFA" */
@Pipe({ name: 'fcfa', standalone: true })
export class FcfaPipe implements PipeTransform {
  transform(v: number | null | undefined, avecUnite = true): string {
    if (v === null || v === undefined) return '—';
    const t = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    return avecUnite ? `${t} FCFA` : t;
  }
}
