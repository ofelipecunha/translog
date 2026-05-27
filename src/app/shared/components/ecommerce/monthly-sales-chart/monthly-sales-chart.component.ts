
import { Component } from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexYAxis,
  ApexGrid,
  ApexFill,
  ApexTooltip,
} from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

type ApexChartContext = {
  el?: HTMLElement;
  w?: { globals: { barWidth: number; seriesNames?: string[] } };
};

@Component({
  selector: 'app-monthly-sales-chart',
  standalone: true,
  imports: [NgApexchartsModule, DropdownComponent, DropdownItemComponent],
  templateUrl: './monthly-sales-chart.component.html',
})
export class MonthlySalesChartComponent {
  static readonly corNubank = '#820AD1';
  static readonly corBancoBrasil = '#FDFC30';

  /** Valores chumbados até a API (lançamentos dos dois bancos no mesmo mês). */
  private readonly nubankMensal = [168, 320, 201, 260, 187, 175, 291, 95, 215, 360, 280, 100];
  private readonly bbMensal = [140, 385, 170, 298, 160, 195, 240, 110, 190, 390, 220, 112];

  public series: ApexAxisChartSeries = [
    { name: 'Nubank', data: [...this.nubankMensal] },
    { name: 'Banco do Brasil', data: [...this.bbMensal] },
  ];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 180,
    toolbar: { show: false },
    events: {
      mounted: (chart) => this.aplicarBarras3d(chart),
      updated: (chart) => this.aplicarBarras3d(chart),
    },
  };

  public xaxis: ApexXAxis = {
    categories: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '48%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public stroke: ApexStroke = {
    show: true,
    width: 1,
    colors: ['transparent', 'rgba(0,0,0,0.14)'],
  };

  public legend: ApexLegend = { show: false };

  public yaxis: ApexYAxis = { title: { text: undefined } };

  public grid: ApexGrid = { yaxis: { lines: { show: true } } };

  public fill: ApexFill = { opacity: 1 };

  public tooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    x: { show: true },
    y: {
      formatter: (val: number, opts) => {
        const nome = opts?.w?.globals?.seriesNames?.[opts.seriesIndex ?? 0] ?? '';
        return `${nome}: ${val}`;
      },
    },
  };

  public colors: string[] = [
    MonthlySalesChartComponent.corNubank,
    MonthlySalesChartComponent.corBancoBrasil,
  ];

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  /**
   * Nubank à esquerda, BB na frente à direita (parcialmente sobreposto), barras verticais.
   */
  private aplicarBarras3d(chartContext: ApexChartContext): void {
    const el = chartContext?.el;
    const barWidth = chartContext?.w?.globals?.barWidth;
    if (!el || !barWidth) {
      return;
    }

    const seriesGroups = el.querySelectorAll<SVGGElement>(
      '.apexcharts-bar-series .apexcharts-series',
    );
    if (seriesGroups.length < 2) {
      return;
    }

    const nubank = seriesGroups[0];
    const bb = seriesGroups[1];

    const escala = 0.86;
    const deslocNubank = barWidth * 0.34;
    const deslocBb = barWidth * 0.58;

    const baseTransform = 'transform-origin: center bottom; transform-box: fill-box;';

    nubank.querySelectorAll<SVGPathElement>('path.apexcharts-bar-area').forEach((path) => {
      path.setAttribute(
        'style',
        `${baseTransform} transform: translate(${-deslocNubank}px, 0) scaleX(${escala}); opacity: 0.95;`,
      );
    });

    bb.querySelectorAll<SVGPathElement>('path.apexcharts-bar-area').forEach((path) => {
      path.setAttribute(
        'style',
        `${baseTransform} transform: translate(${-deslocBb}px, 0) scaleX(${escala}); filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.1));`,
      );
    });
  }
}
