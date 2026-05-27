import { Component } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge.component';

interface Frete {
  id: string;
  origem: string;
  destino: string;
  cliente: string;
  valor: string;
  status: 'Entregue' | 'Em trânsito' | 'Cancelado';
}

@Component({
  selector: 'app-recent-freights',
  imports: [BadgeComponent],
  templateUrl: './recent-freights.component.html',
})
export class RecentFreightsComponent {
  readonly tableData: Frete[] = [
    {
      id: 'FR-2401',
      origem: 'São Paulo, SP',
      destino: 'Curitiba, PR',
      cliente: 'Distribuidora Alfa',
      valor: 'R$ 4.850,00',
      status: 'Entregue',
    },
    {
      id: 'FR-2402',
      origem: 'Campinas, SP',
      destino: 'Belo Horizonte, MG',
      cliente: 'Metalúrgica Beta',
      valor: 'R$ 6.200,00',
      status: 'Em trânsito',
    },
    {
      id: 'FR-2403',
      origem: 'Rio de Janeiro, RJ',
      destino: 'Vitória, ES',
      cliente: 'Comércio Gama',
      valor: 'R$ 3.980,00',
      status: 'Em trânsito',
    },
    {
      id: 'FR-2404',
      origem: 'Porto Alegre, RS',
      destino: 'Florianópolis, SC',
      cliente: 'Tech Delta',
      valor: 'R$ 2.750,00',
      status: 'Cancelado',
    },
    {
      id: 'FR-2405',
      origem: 'Goiânia, GO',
      destino: 'Brasília, DF',
      cliente: 'Agro Epsilon',
      valor: 'R$ 5.120,00',
      status: 'Entregue',
    },
  ];

  getBadgeColor(status: string): 'success' | 'warning' | 'error' {
    if (status === 'Entregue') return 'success';
    if (status === 'Em trânsito') return 'warning';
    return 'error';
  }
}
