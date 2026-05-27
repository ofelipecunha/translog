import { NgClass } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

type StatusFiltro = 'todos' | 'divergencia' | 'ok';

interface DivergenciaGridRow {
  id: string;
  dataHora: string;
  dataIso: string;
  pedido: string;
  origem: string;
  destino: string;
  volumes: number;
  conferidos: number;
  divergencia: number;
  status: 'Divergência' | 'OK';
}

interface FiltrosDivergencia {
  dataInicial: string;
  dataFinal: string;
  pedido: string;
  status: StatusFiltro;
}

@Component({
  selector: 'app-painel-divergencia-page',
  imports: [FormsModule, NgClass, PageBreadcrumbComponent],
  templateUrl: './painel-divergencia-page.component.html',
})
export class PainelDivergenciaPageComponent {
  readonly breadcrumbTrail = [{ label: 'Operações' }];

  dataInicial = '2026-05-18';
  dataFinal = '2026-05-25';
  pedidoBusca = '';
  statusFiltro: StatusFiltro = 'todos';

  private readonly filtrosAplicados = signal<FiltrosDivergencia>({
    dataInicial: '2026-05-18',
    dataFinal: '2026-05-25',
    pedido: '',
    status: 'todos',
  });

  private readonly registrosTodas: DivergenciaGridRow[] = [
    {
      id: '1',
      dataHora: '25/05 11:30',
      dataIso: '2026-05-25',
      pedido: '4587',
      origem: 'Loja 01',
      destino: 'Loja 02',
      volumes: 5,
      conferidos: 3,
      divergencia: 2,
      status: 'Divergência',
    },
    {
      id: '2',
      dataHora: '25/05 10:15',
      dataIso: '2026-05-25',
      pedido: '4586',
      origem: 'Loja 03',
      destino: 'Loja 01',
      volumes: 4,
      conferidos: 4,
      divergencia: 0,
      status: 'OK',
    },
    {
      id: '3',
      dataHora: '25/05 09:50',
      dataIso: '2026-05-25',
      pedido: '4585',
      origem: 'Loja 02',
      destino: 'Loja 04',
      volumes: 6,
      conferidos: 6,
      divergencia: 0,
      status: 'OK',
    },
    {
      id: '4',
      dataHora: '24/05 16:20',
      dataIso: '2026-05-24',
      pedido: '4584',
      origem: 'Loja 01',
      destino: 'Loja 03',
      volumes: 3,
      conferidos: 3,
      divergencia: 0,
      status: 'OK',
    },
    {
      id: '5',
      dataHora: '24/05 15:10',
      dataIso: '2026-05-24',
      pedido: '4583',
      origem: 'Loja 04',
      destino: 'Loja 01',
      volumes: 7,
      conferidos: 6,
      divergencia: 1,
      status: 'Divergência',
    },
    {
      id: '6',
      dataHora: '24/05 13:00',
      dataIso: '2026-05-24',
      pedido: '4582',
      origem: 'Loja 02',
      destino: 'Loja 03',
      volumes: 8,
      conferidos: 5,
      divergencia: 3,
      status: 'Divergência',
    },
    {
      id: '7',
      dataHora: '23/05 17:40',
      dataIso: '2026-05-23',
      pedido: '4581',
      origem: 'Loja 03',
      destino: 'Loja 04',
      volumes: 2,
      conferidos: 2,
      divergencia: 0,
      status: 'OK',
    },
    {
      id: '8',
      dataHora: '20/05 10:00',
      dataIso: '2026-05-20',
      pedido: '4580',
      origem: 'Loja 01',
      destino: 'Loja 04',
      volumes: 5,
      conferidos: 4,
      divergencia: 1,
      status: 'Divergência',
    },
  ];

  readonly registrosFiltrados = computed(() => {
    const f = this.filtrosAplicados();
    return this.registrosTodas.filter((r) => {
      if (f.dataInicial && r.dataIso < f.dataInicial) {
        return false;
      }
      if (f.dataFinal && r.dataIso > f.dataFinal) {
        return false;
      }
      if (f.pedido.trim() && !r.pedido.includes(f.pedido.trim())) {
        return false;
      }
      if (f.status === 'divergencia' && r.status !== 'Divergência') {
        return false;
      }
      if (f.status === 'ok' && r.status !== 'OK') {
        return false;
      }
      return true;
    });
  });

  buscar(): void {
    this.filtrosAplicados.set({
      dataInicial: this.dataInicial,
      dataFinal: this.dataFinal,
      pedido: this.pedidoBusca.trim(),
      status: this.statusFiltro,
    });
  }

  limpar(): void {
    this.dataInicial = '2026-05-18';
    this.dataFinal = '2026-05-25';
    this.pedidoBusca = '';
    this.statusFiltro = 'todos';
    this.filtrosAplicados.set({
      dataInicial: '2026-05-18',
      dataFinal: '2026-05-25',
      pedido: '',
      status: 'todos',
    });
  }

  temDivergencia(row: DivergenciaGridRow): boolean {
    return row.divergencia > 0;
  }
}
