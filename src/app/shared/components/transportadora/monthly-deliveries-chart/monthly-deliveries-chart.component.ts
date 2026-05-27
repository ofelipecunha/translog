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

@Component({
  selector: 'app-monthly-deliveries-chart',
  host: { class: 'block h-full w-full' },
  imports: [NgApexchartsModule, DropdownComponent, DropdownItemComponent],
  templateUrl: './monthly-deliveries-chart.component.html',
})
export class MonthlyDeliveriesChartComponent {
  private readonly entregasMensais = [820, 932, 901, 934, 1290, 1330, 1320, 1180, 1240, 1380, 1284, 1410];

  public series: ApexAxisChartSeries = [
    { name: 'Entregas concluídas', data: [...this.entregasMensais] },
  ];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 320,
    width: '100%',
    toolbar: { show: false },
  };

  public xaxis: ApexXAxis = {
    categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { fontSize: '12px' },
    },
  };

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '50%',
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  };

  public dataLabels: ApexDataLabels = { enabled: false };
  public stroke: ApexStroke = { show: true, width: 1, colors: ['transparent'] };
  public legend: ApexLegend = { show: false };
  public yaxis: ApexYAxis = { title: { text: undefined } };
  public grid: ApexGrid = {
    padding: { left: 8, right: 8 },
    yaxis: { lines: { show: true } },
  };
  public fill: ApexFill = { opacity: 1 };
  public tooltip: ApexTooltip = { shared: true, intersect: false, x: { show: true } };
  public colors: string[] = ['#465fff'];

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
