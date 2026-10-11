import { Component, Input } from '@angular/core';
import { Kpi } from '../core/models/models';

@Component({
  selector: 'app-kpi',
  standalone: true,
  template: `
    <div class="carte kpi">
      <span class="lib">{{ kpi.libelle }}</span>
      <span class="val">{{ kpi.valeur }}</span>
      @if (kpi.detail) { <span class="det" [class]="kpi.tendance ?? ''">{{ kpi.detail }}</span> }
    </div>`,
})
export class KpiComponent {
  @Input({ required: true }) kpi!: Kpi;
}
