import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { VirtualCreditCardComponent } from '../virtual-credit-card/virtual-credit-card.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';
import { PierreService } from '../../../../core/pierre/pierre.service';
import type {
  PierreContaBalance,
  PierreGetBalanceResponse,
  PierreTransacao,
} from '../../../../core/pierre/pierre.models';

export type PierreBancoCard = 'nubank' | 'bb';
export type PierreBancoExibicao = PierreBancoCard | 'todos';

@Component({
  selector: 'app-ecommerce-metrics',
  imports: [NgClass, BadgeComponent, ModalComponent, SafeHtmlPipe, VirtualCreditCardComponent],
  templateUrl: './ecommerce-metrics.component.html',
})
export class EcommerceMetricsComponent implements OnInit {
  /** `todos` (padrão) exibe Nubank + BB; nas rotas `/bancos/*` passa um banco só. */
  @Input() bancoExibido: PierreBancoExibicao = 'todos';

  readonly pierreService = inject(PierreService);

  exibirCardNubank(): boolean {
    return this.bancoExibido === 'todos' || this.bancoExibido === 'nubank';
  }

  exibirCardBb(): boolean {
    return this.bancoExibido === 'todos' || this.bancoExibido === 'bb';
  }

  get layoutUmCard(): boolean {
    return this.bancoExibido !== 'todos';
  }

  /** Cartão visual só nas rotas `/bancos/*`; na dashboard usa saldo em texto. */
  get exibirCartaoVirtual(): boolean {
    return this.layoutUmCard;
  }

  readonly pierreContas = signal<PierreContaBalance[]>([]);
  readonly pierreCarregando = signal(false);
  readonly pierreErro = signal<string | null>(null);

  readonly historicoAberto = signal(false);
  readonly historicoBanco = signal<PierreBancoCard>('nubank');
  readonly historicoCarregando = signal(false);
  readonly historicoErro = signal<string | null>(null);
  readonly historicoBase = signal<PierreTransacao[]>([]);
  readonly historicoFiltrado = signal<PierreTransacao[]>([]);
  readonly filtroDescricao = signal('');
  readonly modalPagina = signal(1);
  readonly modalItensPorPagina = 5;

  readonly diasJanelaExtrato = 30;

  /** Quando true, os saldos nos cards aparecem mascarados (ex.: R$ *.***,**). */
  readonly saldoOculto = signal(false);

  /** Saldo fixo de demonstração quando a API não retorna conta Nubank. */
  private readonly saldoNubankChumbado = 47.93;

  readonly saldoNubankFormatado = computed(() => {
    const daApi = this.saldoConta('nubank');
    return this.formatarMoeda(daApi ?? this.saldoNubankChumbado);
  });

  /** Saldo fixo até existir endpoint/conta BB na API Pierre. */
  private readonly saldoBbChumbado = 23.56;

  readonly saldoBbFormatado = computed(() => {
    const daApi = this.saldoConta('bb');
    return this.formatarMoeda(daApi ?? this.saldoBbChumbado);
  });

  readonly totalPaginasModal = computed(() => {
    const n = this.historicoFiltrado().length;
    if (n === 0) {
      return 1;
    }
    return Math.ceil(n / this.modalItensPorPagina);
  });

  readonly transacoesPagina = computed(() => {
    const lista = this.historicoFiltrado();
    const p = this.modalPagina();
    const start = (p - 1) * this.modalItensPorPagina;
    return lista.slice(start, start + this.modalItensPorPagina);
  });

  readonly intervaloExibicao = computed(() => {
    const lista = this.historicoFiltrado();
    if (lista.length === 0) {
      return { de: 0, ate: 0 };
    }
    const p = this.modalPagina();
    const de = (p - 1) * this.modalItensPorPagina + 1;
    const ate = Math.min(p * this.modalItensPorPagina, lista.length);
    return { de, ate };
  });

  public icons = {
    arrowUpIcon: `<svg class="fill-current" width="1em" height="1em" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.06462 1.62393C6.20193 1.47072 6.40135 1.37432 6.62329 1.37432C6.6236 1.37432 6.62391 1.37432 6.62422 1.37432C6.81631 1.37415 7.00845 1.44731 7.15505 1.5938L10.1551 4.5918C10.4481 4.88459 10.4483 5.35946 10.1555 5.65246C9.86273 5.94546 9.38785 5.94562 9.09486 5.65283L7.37329 3.93247L7.37329 10.125C7.37329 10.5392 7.03751 10.875 6.62329 10.875C6.20908 10.875 5.87329 10.5392 5.87329 10.125L5.87329 3.93578L4.15516 5.65281C3.86218 5.94561 3.3873 5.94546 3.0945 5.65248C2.8017 5.35949 2.80185 4.88462 3.09484 4.59182L6.06462 1.62393Z" fill=""></path></svg>`,
    boxIconLine: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-gray-800 size-6 dark:text-white/90"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.665 3.75621C11.8762 3.65064 12.1247 3.65064 12.3358 3.75621L18.7807 6.97856L12.3358 10.2009C12.1247 10.3065 11.8762 10.3065 11.665 10.2009L5.22014 6.97856L11.665 3.75621ZM4.29297 8.19203V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0366V11.6513C11.1631 11.6205 11.0777 11.5843 10.9942 11.5426L4.29297 8.19203ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19202L13.0066 11.5426C12.9229 11.5844 12.8372 11.6208 12.75 11.6516V20.037ZM13.0066 2.41456C12.3732 2.09786 11.6277 2.09786 10.9942 2.41456L4.03676 5.89319C3.27449 6.27432 2.79297 7.05342 2.79297 7.90566V16.0946C2.79297 16.9469 3.27448 17.726 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.726 21.2079 16.9469 21.2079 16.0946V7.90566C21.2079 7.05342 20.7264 6.27432 19.9641 5.89319L13.0066 2.41456Z" fill="currentColor"></path></svg>`,
    arrowDownIcon: `<svg class="fill-current" width="1em" height="1em" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z" fill=""></path></svg>`,
  };

  ngOnInit(): void {
    this.atualizarSaldo();
  }

  /** Novo GET do saldo na API Pierre (botão atualizar do card). */
  atualizarSaldo(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.pierreService.clearExtratoCache();
    this.carregarSaldoPierre();
  }

  alternarVisibilidadeSaldo(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.saldoOculto.update((v) => !v);
  }

  exibirSaldo(valorFormatado: string): string {
    if (!this.saldoOculto() || valorFormatado === '—' || valorFormatado === '…') {
      return valorFormatado;
    }
    return valorFormatado.replace(/\d/g, '*');
  }

  abrirHistorico(banco: PierreBancoCard): void {
    if (!this.pierreService.hasApiKey()) {
      return;
    }
    this.historicoBanco.set(banco);
    this.filtroDescricao.set('');
    this.modalPagina.set(1);
    this.historicoErro.set(null);
    this.historicoAberto.set(true);
    this.historicoCarregando.set(true);
    const { inicio, fim } = this.intervaloExtrato();
    this.pierreService
      .getTransactionsRaw(inicio, fim)
      .pipe(
        timeout(12000),
        finalize(() => this.historicoCarregando.set(false)),
      )
      .subscribe({
        next: (lista: PierreTransacao[]) => {
          const doBanco = lista.filter((t) => this.transacaoDoBanco(t, banco));
          this.historicoBase.set(doBanco);
          this.historicoFiltrado.set([...doBanco]);
        },
        error: (err: unknown) => {
          this.historicoErro.set(this.msgErro(err, 'histórico'));
          this.historicoBase.set([]);
          this.historicoFiltrado.set([]);
        },
      });
  }

  fecharHistorico(): void {
    this.historicoAberto.set(false);
  }

  aplicarFiltroDescricao(valor: string): void {
    this.filtroDescricao.set(valor);
    const d = valor.trim().toLowerCase();
    const base = this.historicoBase();
    if (!d) {
      this.historicoFiltrado.set([...base]);
    } else {
      this.historicoFiltrado.set(
        base.filter((t) => (t.description ?? '').toLowerCase().includes(d)),
      );
    }
    this.modalPagina.set(1);
  }

  limparFiltroHistorico(): void {
    this.filtroDescricao.set('');
    this.historicoFiltrado.set([...this.historicoBase()]);
    this.modalPagina.set(1);
  }

  paginaAnterior(): void {
    if (this.modalPagina() > 1) {
      this.modalPagina.update((p) => p - 1);
    }
  }

  paginaProxima(): void {
    if (this.modalPagina() < this.totalPaginasModal()) {
      this.modalPagina.update((p) => p + 1);
    }
  }

  categoriaTransacao(txn: PierreTransacao): string {
    return txn.category?.trim() || txn.original_category?.trim() || '—';
  }

  descricaoModal(txn: PierreTransacao): string {
    const d = txn.description?.trim() ?? '';
    if (!d) {
      return '—';
    }
    const pipe = d.indexOf('|');
    if (pipe >= 0) {
      const resto = d.slice(pipe + 1).trim();
      return resto.length > 0 ? resto : d;
    }
    return d;
  }

  formatarDataCurta(iso: string): string {
    if (!iso?.trim()) {
      return iso ?? '';
    }
    const s = iso.trim();
    const cal = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (cal) {
      const [, y, m, d] = cal;
      return `${d}/${m}/${y}`;
    }
    const dt = new Date(s);
    if (Number.isNaN(dt.getTime())) {
      return s;
    }
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  formatarValorMovimentacao(valor: number | string): string {
    const numero = this.paraNumero(valor);
    const moeda = this.formatarMoeda(Math.abs(numero));
    return numero < 0 ? `- ${moeda}` : `+ ${moeda}`;
  }

  classeMovimentacao(valor: number | string): string {
    return this.paraNumero(valor) < 0 ? 'text-error-500' : 'text-success-500';
  }

  private carregarSaldoPierre(): void {
    if (!this.pierreService.hasApiKey()) {
      this.pierreErro.set('Defina pierreApiKey no environment.');
      this.pierreContas.set([]);
      return;
    }
    this.pierreCarregando.set(true);
    this.pierreErro.set(null);
    this.pierreService
      .getBalance()
      .pipe(
        timeout(12000),
        finalize(() => this.pierreCarregando.set(false)),
      )
      .subscribe({
        next: (balance: PierreGetBalanceResponse) => {
          this.pierreContas.set(balance?.data?.accounts ?? []);
        },
        error: (err: unknown) => {
          this.pierreErro.set(this.msgErro(err, 'saldo'));
          this.pierreContas.set([]);
        },
      });
  }

  private saldoConta(banco: PierreBancoCard): number | null {
    const conta = this.pierreContas().find((c) => this.contaDoBanco(c, banco));
    if (!conta) {
      return null;
    }
    return this.paraNumero(conta.balance);
  }

  private formatarSaldoConta(valor: number | null): string {
    if (valor === null) {
      return '—';
    }
    return this.formatarMoeda(valor);
  }

  private contaDoBanco(conta: PierreContaBalance, banco: PierreBancoCard): boolean {
    const texto = `${conta.name ?? ''} ${conta.account_type ?? ''} ${conta.account_subtype ?? ''}`.toLowerCase();
    if (banco === 'nubank') {
      return /nubank|\bnu\b|nu pagamentos/.test(texto);
    }
    return /banco do brasil|\bbb\b/.test(texto);
  }

  private transacaoDoBanco(txn: PierreTransacao, banco: PierreBancoCard): boolean {
    const texto = `${txn.account_name ?? ''} ${txn.account_marketing_name ?? ''}`.toLowerCase();
    if (banco === 'nubank') {
      return /nubank|\bnu\b|nu pagamentos/.test(texto);
    }
    return /banco do brasil|\bbb\b/.test(texto);
  }

  private intervaloExtrato(): { inicio: Date; fim: Date } {
    const fim = new Date();
    const inicio = new Date(fim);
    inicio.setDate(fim.getDate() - (this.diasJanelaExtrato - 1));
    return { inicio, fim };
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  private paraNumero(valor: unknown): number {
    if (typeof valor === 'number') {
      return Number.isFinite(valor) ? valor : 0;
    }
    if (typeof valor === 'string') {
      const normalizado = valor.replace(',', '.').trim();
      const convertido = Number(normalizado);
      return Number.isFinite(convertido) ? convertido : 0;
    }
    return 0;
  }

  private msgErro(err: unknown, contexto: 'saldo' | 'histórico'): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 || err.status === 403) {
        return `API Pierre (${contexto}): chave inválida ou sem permissão.`;
      }
      if (err.status === 0) {
        return `API Pierre (${contexto}): rede ou CORS bloqueado.`;
      }
      if (typeof err.status === 'number' && err.status > 0) {
        return `API Pierre (${contexto}): HTTP ${err.status}.`;
      }
    }
    if (err instanceof Error && err.message.includes('pierreApiKey')) {
      return err.message;
    }
    return `API Pierre (${contexto}): tempo esgotado ou erro inesperado.`;
  }
}
