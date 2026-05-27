import { NgClass } from '@angular/common';
import { Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

type AbaCarga = 'embarque' | 'desembarque';

interface InfoCarga {
  numeroCarga: string;
  dataHora: string;
  veiculoPlaca: string;
  motorista: string;
  origem: string;
  destino: string;
  volumesCarregados: number;
  status: string;
  statusClasse: 'transito' | 'pendente' | 'finalizado';
}

interface ResumoVolume {
  chave: string;
  label: string;
  valor: number;
  cor: 'success' | 'brand' | 'gray' | 'warning' | 'error';
}

interface Movimentacao {
  dataHora: string;
  evento: string;
  local: string;
  volumes: number;
  usuario: string;
  usuarioSistema?: boolean;
}

interface DadosAba {
  info: InfoCarga;
  resumo: ResumoVolume[];
  historico: Movimentacao[];
}

@Component({
  selector: 'app-carga-descarga-page',
  imports: [FormsModule, NgClass, PageBreadcrumbComponent],
  templateUrl: './carga-descarga-page.component.html',
})
export class CargaDescargaPageComponent {
  readonly breadcrumbTrail = [{ label: 'Operações' }];
  readonly abaAtiva = signal<AbaCarga>('embarque');
  readonly termoBusca = signal('');
  readonly mensagemBusca = signal<string | null>(null);

  private readonly codigoInputRef = viewChild<ElementRef<HTMLInputElement>>('buscaInput');

  private readonly dadosEmbarque: DadosAba = {
    info: {
      numeroCarga: 'CARGA-250525-001',
      dataHora: '25/05/2026 09:30',
      veiculoPlaca: 'ABC1D23',
      motorista: 'João da Silva',
      origem: 'Loja 01 - Matriz',
      destino: 'Loja 02 - Centro',
      volumesCarregados: 28,
      status: 'Em trânsito',
      statusClasse: 'transito',
    },
    resumo: [
      { chave: 'carregados', label: 'Carregados', valor: 28, cor: 'success' },
      { chave: 'transito', label: 'Em Trânsito', valor: 28, cor: 'brand' },
      { chave: 'descarregados', label: 'Descarregados', valor: 0, cor: 'gray' },
      { chave: 'pendentes', label: 'Pendentes', valor: 0, cor: 'warning' },
      { chave: 'divergencia', label: 'Divergência', valor: 0, cor: 'error' },
    ],
    historico: [
      {
        dataHora: '25/05 09:30',
        evento: 'Carga iniciada',
        local: 'Loja 01 - Matriz',
        volumes: 28,
        usuario: 'Operador',
      },
      {
        dataHora: '25/05 10:15',
        evento: 'Carga finalizada',
        local: 'Loja 01 - Matriz',
        volumes: 28,
        usuario: 'Operador',
      },
      {
        dataHora: '25/05 10:20',
        evento: 'Em trânsito',
        local: '—',
        volumes: 28,
        usuario: 'Sistema',
        usuarioSistema: true,
      },
    ],
  };

  private readonly dadosDesembarque: DadosAba = {
    info: {
      numeroCarga: 'CARGA-250525-002',
      dataHora: '26/05/2026 14:00',
      veiculoPlaca: 'XYZ9K87',
      motorista: 'Maria Souza',
      origem: 'Loja 02 - Centro',
      destino: 'Loja 03 - Norte',
      volumesCarregados: 15,
      status: 'Pendente',
      statusClasse: 'pendente',
    },
    resumo: [
      { chave: 'carregados', label: 'Carregados', valor: 15, cor: 'success' },
      { chave: 'transito', label: 'Em Trânsito', valor: 0, cor: 'brand' },
      { chave: 'descarregados', label: 'Descarregados', valor: 0, cor: 'gray' },
      { chave: 'pendentes', label: 'Pendentes', valor: 15, cor: 'warning' },
      { chave: 'divergencia', label: 'Divergência', valor: 0, cor: 'error' },
    ],
    historico: [
      {
        dataHora: '26/05 14:00',
        evento: 'Aguardando desembarque',
        local: 'Loja 02 - Centro',
        volumes: 15,
        usuario: 'Sistema',
        usuarioSistema: true,
      },
    ],
  };

  readonly cargaVisivel = signal(true);

  readonly dadosAtuais = computed(() =>
    this.abaAtiva() === 'embarque' ? this.dadosEmbarque : this.dadosDesembarque,
  );

  readonly totalVolumes = computed(() => {
    const resumo = this.dadosAtuais().resumo;
    return resumo.find((r) => r.chave === 'carregados')?.valor ?? 0;
  });

  selecionarAba(aba: AbaCarga): void {
    this.abaAtiva.set(aba);
    this.mensagemBusca.set(null);
  }

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

    const termoLower = termo.toLowerCase();
    const achouEmbarque =
      this.dadosEmbarque.info.numeroCarga.toLowerCase().includes(termoLower) ||
      termoLower.includes('carga-250525-001') ||
      termo === '001';
    const achouDesembarque =
      this.dadosDesembarque.info.numeroCarga.toLowerCase().includes(termoLower) ||
      termoLower.includes('carga-250525-002');

    if (achouEmbarque) {
      this.abaAtiva.set('embarque');
      this.cargaVisivel.set(true);
      this.mensagemBusca.set(null);
      this.termoBusca.set('');
      return;
    }

    if (achouDesembarque) {
      this.abaAtiva.set('desembarque');
      this.cargaVisivel.set(true);
      this.mensagemBusca.set(null);
      this.termoBusca.set('');
      return;
    }

    this.cargaVisivel.set(false);
    this.mensagemBusca.set('Nenhuma carga encontrada para o termo informado.');
  }

  limparBusca(): void {
    this.termoBusca.set('');
    this.mensagemBusca.set(null);
    this.cargaVisivel.set(true);
    this.abaAtiva.set('embarque');
    this.focarBusca();
  }

  classeStatusBadge(classe: InfoCarga['statusClasse']): string {
    switch (classe) {
      case 'transito':
        return 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400';
      case 'pendente':
        return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400';
      case 'finalizado':
        return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400';
    }
  }

  classeValorResumo(cor: ResumoVolume['cor']): string {
    switch (cor) {
      case 'success':
        return 'text-success-600';
      case 'brand':
        return 'text-brand-600 dark:text-brand-400';
      case 'warning':
        return 'text-warning-600';
      case 'error':
        return 'text-error-600';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  private focarBusca(): void {
    setTimeout(() => this.codigoInputRef()?.nativeElement.focus(), 0);
  }
}
