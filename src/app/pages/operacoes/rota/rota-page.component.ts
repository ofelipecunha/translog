import { NgClass } from '@angular/common';
import { Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

type StatusRota = 'transito' | 'carregada' | 'aguardando';

interface RotaDia {
  id: string;
  origem: string;
  destino: string;
  pedidos: number;
  volumes: number;
  status: StatusRota;
  statusLabel: string;
  pedidosNumeros: string[];
  volumesCodigos: string[];
}

@Component({
  selector: 'app-rota-page',
  imports: [FormsModule, NgClass, PageBreadcrumbComponent],
  templateUrl: './rota-page.component.html',
})
export class RotaPageComponent {
  readonly breadcrumbTrail = [{ label: 'Operações' }];

  dataFiltro = '2026-05-25';
  readonly termoBusca = signal('');
  readonly mensagemBusca = signal<string | null>(null);

  private readonly buscaInputRef = viewChild<ElementRef<HTMLInputElement>>('buscaInput');

  private readonly rotasTodas: RotaDia[] = [
    {
      id: '1',
      origem: 'Loja 01 - Matriz',
      destino: 'Loja 02 - Centro',
      pedidos: 12,
      volumes: 28,
      status: 'transito',
      statusLabel: 'Em trânsito',
      pedidosNumeros: ['4587', '4590', '4591'],
      volumesCodigos: [
        '20260525-4587-01',
        '20260525-4587-02',
        '20260525-4590-01',
      ],
    },
    {
      id: '2',
      origem: 'Loja 01 - Matriz',
      destino: 'Loja 03 - Norte',
      pedidos: 8,
      volumes: 15,
      status: 'carregada',
      statusLabel: 'Carregada',
      pedidosNumeros: ['4600', '4601'],
      volumesCodigos: ['20260525-4600-01', '20260525-4601-01'],
    },
    {
      id: '3',
      origem: 'Loja 02 - Centro',
      destino: 'Loja 04 - Sul',
      pedidos: 5,
      volumes: 10,
      status: 'aguardando',
      statusLabel: 'Aguardando Carga',
      pedidosNumeros: ['4610'],
      volumesCodigos: ['20260525-4610-01'],
    },
  ];

  readonly rotasFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    if (!termo) {
      return this.rotasTodas;
    }

    return this.rotasTodas.filter(
      (r) =>
        r.origem.toLowerCase().includes(termo) ||
        r.destino.toLowerCase().includes(termo) ||
        r.pedidosNumeros.some((p) => p.toLowerCase().includes(termo)) ||
        r.volumesCodigos.some((c) => c.toLowerCase().includes(termo)),
    );
  });

  onBuscaInput(valor: string): void {
    this.termoBusca.set(valor);
    this.mensagemBusca.set(null);
  }

  onBuscaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.pesquisar();
    }
  }

  pesquisar(): void {
    const termo = this.termoBusca().trim();
    if (!termo) {
      return;
    }
    if (this.rotasFiltradas().length === 0) {
      this.mensagemBusca.set('Nenhuma rota encontrada para o termo informado.');
    } else {
      this.mensagemBusca.set(null);
    }
  }

  limparBusca(): void {
    this.termoBusca.set('');
    this.mensagemBusca.set(null);
    this.focarBusca();
  }

  classeStatusTexto(status: StatusRota): string {
    switch (status) {
      case 'transito':
        return 'text-brand-600 dark:text-brand-400';
      case 'carregada':
        return 'text-success-600';
      case 'aguardando':
        return 'text-warning-600';
    }
  }

  private focarBusca(): void {
    setTimeout(() => this.buscaInputRef()?.nativeElement.focus(), 0);
  }
}
