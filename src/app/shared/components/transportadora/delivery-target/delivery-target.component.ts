import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexNonAxisChartSeries, ApexChart, ApexPlotOptions, ApexFill, ApexStroke, ApexLegend } from 'ng-apexcharts';

@Component({
  selector: 'app-delivery-target',
  host: { class: 'block h-full' },
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './delivery-target.component.html',
})
export class DeliveryTargetComponent {
  readonly metaMensal = 1500;
  readonly entregasRealizadas = 1284;
  readonly percentual = Math.round((this.entregasRealizadas / this.metaMensal) * 100);

  series: ApexNonAxisChartSeries = [this.percentual];
  chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'radialBar',
    height: 220,
    sparkline: { enabled: false },
  };
  plotOptions: ApexPlotOptions = {
    radialBar: {
      hollow: { size: '65%' },
      track: { background: '#E4E7EC', strokeWidth: '100%' },
      dataLabels: {
        name: { show: true, fontSize: '14px', color: '#667085', offsetY: 24 },
        value: {
          show: true,
          fontSize: '36px',
          fontWeight: 700,
          color: '#101828',
          offsetY: -8,
          formatter: () => `${this.percentual}%`,
        },
      },
    },
  };
  fill: ApexFill = {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'horizontal',
      gradientToColors: ['#3641f5'],
      stops: [0, 100],
    },
  };
  stroke: ApexStroke = { lineCap: 'round' };
  labels: string[] = ['Meta mensal'];
  colors: string[] = ['#465fff'];
  legend: ApexLegend = { show: false };
}
