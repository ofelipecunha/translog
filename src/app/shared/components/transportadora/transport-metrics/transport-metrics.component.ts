import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

interface MetricCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

const ORANGE = '#FB6514';

@Component({
  selector: 'app-transport-metrics',
  imports: [CommonModule, BadgeComponent, SafeHtmlPipe],
  templateUrl: './transport-metrics.component.html',
})
export class TransportMetricsComponent {
  readonly metrics: MetricCard[] = [
    {
      label: 'Volumes Enviados Hoje',
      value: '265',
      change: '+12%',
      trend: 'up',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3V15M12 15L8 11M12 15L16 11" stroke="${ORANGE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 19H20" stroke="${ORANGE}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    },
    {
      label: 'Volumes Recebidos Hoje',
      value: '198',
      change: '+8%',
      trend: 'up',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21V9M12 9L8 13M12 9L16 13" stroke="${ORANGE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 5H20" stroke="${ORANGE}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    },
    {
      label: 'Em Trânsito',
      value: '67',
      change: '-5%',
      trend: 'down',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H21M16 7L21 12L16 17" stroke="${ORANGE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    {
      label: 'Divergências Abertas',
      value: '12',
      change: '+3',
      trend: 'down',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9V13M12 17H12.01" stroke="${ORANGE}" stroke-width="1.5" stroke-linecap="round"/><path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23672 20.5467 2.53771 20.7239C2.83869 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="${ORANGE}" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    },
    {
      label: 'Conferências Pendentes',
      value: '24',
      change: '+7',
      trend: 'down',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="${ORANGE}" stroke-width="1.5"/><path d="M9 7C9 5.89543 9.89543 5 11 5H13C14.1046 5 15 5.89543 15 7V7C15 8.10457 14.1046 9 13 9H11C9.89543 9 9 8.10457 9 7V7Z" stroke="${ORANGE}" stroke-width="1.5"/><path d="M9 12H15M9 16H13" stroke="${ORANGE}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    },
  ];
}
