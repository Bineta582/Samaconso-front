import { Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';

/** Enveloppe Chart.js : <app-graphique type="line" [donnees]="..." [options]="..."/> */
@Component({
  selector: 'app-graphique',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [':host{display:block;width:100%;height:100%}'],
})
export class GraphiqueComponent implements OnChanges, OnDestroy {
  @Input() type: ChartType = 'line';
  @Input() donnees!: ChartConfiguration['data'];
  @Input() options: ChartConfiguration['options'] = {};
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngOnChanges() {
    if (!this.donnees) return;
    this.chart?.destroy();
    this.chart = new Chart(this.canvas.nativeElement, {
      type: this.type,
      data: this.donnees,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        ...this.options,
      },
    });
  }

  ngOnDestroy() { this.chart?.destroy(); }
}

export const COULEURS = {
  vert: '#1f4e3d', menthe: '#2fbf87', jaune: '#ffc94a', gris: '#a9a69a',
  palette: ['#1f4e3d', '#2fbf87', '#ffc94a', '#b9cfc3', '#7fa096', '#d8d4c7'],
};

export const OPTIONS_AXES = {
  scales: {
    x: { grid: { display: false }, ticks: { color: '#6b7570' } },
    y: { grid: { color: '#eeebe1' }, ticks: { color: '#6b7570' }, beginAtZero: true },
  },
} as const;
