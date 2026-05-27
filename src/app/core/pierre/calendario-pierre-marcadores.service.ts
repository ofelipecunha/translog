import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';
import { PierreService } from './pierre.service';
import type { CalendarioMarcadorDia } from './calendario-pierre-marcadores.models';
import type { PierrePaymentReminder, PierreTransacao } from './pierre.models';
import type { PierreBancoTransacao } from './pierre-transacao-format.util';
import {
  descricaoTransacaoPierre,
  formatarMoedaPierre,
  isEmprestimoLembretePierre,
  isEmprestimoTransacaoPierre,
  lembreteEmprestimoParaTransacaoPierre,
  normalizarDataTransacaoPierre,
  paraNumeroTransacao,
  transacaoBancoPierre,
} from './pierre-transacao-format.util';

@Injectable({ providedIn: 'root' })
export class CalendarioPierreMarcadoresService {
  private readonly pierre = inject(PierreService);

  private extratoPorDia = new Map<string, PierreTransacao[]>();
  private extratoNubankPorDia = new Set<string>();
  private extratoBbPorDia = new Set<string>();
  private emprestimoPorDia = new Set<string>();
  private emprestimosLoanPorDia = new Map<string, PierreTransacao[]>();
  private lembretesEmprestimoPorDia = new Map<string, PierrePaymentReminder[]>();

  /**
   * Carrega extrato (get-transactions), lembretes e empréstimos para marcar dias no calendário.
   */
  carregarParaIntervalo(dataInicio: string, dataFim: string): Observable<CalendarioMarcadorDia[]> {
    if (!this.pierre.hasApiKey() || !dataInicio || !dataFim) {
      this.limparExtrato();
      return of([]);
    }

    const inicio = this.parseIsoLocal(dataInicio);
    const fim = this.parseIsoLocal(dataFim);
    if (!inicio || !fim) {
      this.limparExtrato();
      return of([]);
    }

    const diasLembretes = Math.max(30, this.diasNoIntervalo(dataInicio, dataFim), this.diasEntreHojeEFim(dataFim));

    return forkJoin({
      extrato: this.pierre.getTransactionsRaw(inicio, fim).pipe(
        catchError(() => of([] as PierreTransacao[])),
      ),
      lembretes: this.pierre.listPaymentReminders('upcoming', diasLembretes).pipe(
        catchError(() => of([] as PierrePaymentReminder[])),
      ),
      lembretesAll: this.pierre.listPaymentReminders('all').pipe(
        catchError(() => of([] as PierrePaymentReminder[])),
      ),
      emprestimos: this.pierre.getLoanTransactions(inicio, fim).pipe(
        catchError(() => of([] as PierreTransacao[])),
      ),
    }).pipe(
      map(({ extrato, lembretes, lembretesAll, emprestimos }) => {
        this.extratoPorDia = this.agruparExtratoPorDia(extrato);

        const mapaLembretes = new Map<string, PierrePaymentReminder>();
        for (const item of [...lembretes, ...lembretesAll]) {
          const id = item.id ?? `${item.title}-${item.dueDate}`;
          if (!mapaLembretes.has(id)) {
            mapaLembretes.set(id, item);
          }
        }

        this.atualizarEmprestimoPorDia(
          [...mapaLembretes.values()],
          emprestimos,
          dataInicio,
          dataFim,
        );

        const marcadoresExtrato = this.marcadoresDeExtrato(dataInicio, dataFim);
        const outros = this.mesclarMarcadores(
          [...mapaLembretes.values()],
          emprestimos,
          dataInicio,
          dataFim,
        );
        const marcadoresEmprestimo = this.marcadoresEmprestimoCalendario(dataInicio, dataFim);

        return [...marcadoresExtrato, ...marcadoresEmprestimo, ...outros].sort((a, b) => {
          const cmpData = a.data.localeCompare(b.data);
          if (cmpData !== 0) {
            return cmpData;
          }
          return a.titulo.localeCompare(b.titulo, 'pt-BR');
        });
      }),
    );
  }

  obterTransacoesDoDia(iso: string, banco?: PierreBancoTransacao): PierreTransacao[] {
    const lista = [...(this.extratoPorDia.get(iso) ?? [])];
    if (!banco) {
      return lista;
    }
    return lista.filter((t) => transacaoBancoPierre(t) === banco);
  }

  temExtratoNoDia(iso: string): boolean {
    return (this.extratoPorDia.get(iso)?.length ?? 0) > 0;
  }

  temExtratoNubankNoDia(iso: string): boolean {
    return this.extratoNubankPorDia.has(iso);
  }

  temExtratoBbNoDia(iso: string): boolean {
    return this.extratoBbPorDia.has(iso);
  }

  temEmprestimoNoDia(iso: string): boolean {
    return this.emprestimoPorDia.has(iso);
  }

  obterTransacoesEmprestimoDoDia(iso: string): PierreTransacao[] {
    const vistos = new Set<string>();
    const lista: PierreTransacao[] = [];

    const incluir = (txn: PierreTransacao): void => {
      const chave = txn.id || `${txn.date}-${descricaoTransacaoPierre(txn)}`;
      if (vistos.has(chave)) {
        return;
      }
      vistos.add(chave);
      lista.push(txn);
    };

    for (const txn of this.extratoPorDia.get(iso) ?? []) {
      if (isEmprestimoTransacaoPierre(txn)) {
        incluir(txn);
      }
    }

    for (const txn of this.emprestimosLoanPorDia.get(iso) ?? []) {
      incluir(txn);
    }

    if (lista.length === 0) {
      for (const item of this.lembretesEmprestimoPorDia.get(iso) ?? []) {
        incluir(lembreteEmprestimoParaTransacaoPierre(item));
      }
    }

    return lista;
  }

  obterLembretesEmprestimoDoDia(iso: string): PierrePaymentReminder[] {
    return [...(this.lembretesEmprestimoPorDia.get(iso) ?? [])];
  }

  /** ISO (YYYY-MM-DD) → quantidade de marcadores Pierre na data. */
  contarPorData(marcadores: CalendarioMarcadorDia[], iso: string): number {
    return marcadores.filter((m) => m.data === iso).length;
  }

  private marcadoresDeExtrato(dataInicio: string, dataFim: string): CalendarioMarcadorDia[] {
    const lista: CalendarioMarcadorDia[] = [];

    for (const [data, transacoes] of this.extratoPorDia) {
      if (!this.dataNoIntervalo(data, dataInicio, dataFim) || transacoes.length === 0) {
        continue;
      }

      const porBanco: PierreBancoTransacao[] = ['nubank', 'bb'];
      for (const banco of porBanco) {
        const doBanco = transacoes.filter((t) => transacaoBancoPierre(t) === banco);
        if (doBanco.length === 0) {
          continue;
        }
        const total = doBanco.reduce((acc, t) => acc + paraNumeroTransacao(t.amount), 0);
        const qtd = doBanco.length;
        const nomeBanco = banco === 'nubank' ? 'Nubank' : 'Banco do Brasil';
        const titulo =
          qtd === 1
            ? `${nomeBanco} · 1 lanç. · ${formatarMoedaPierre(Math.abs(total))}`
            : `${nomeBanco} · ${qtd} lanç. · ${formatarMoedaPierre(Math.abs(total))}`;

        lista.push({
          id: `extrato-${banco}-${data}`,
          titulo,
          data,
          valor: total,
          origem: 'extrato',
          banco,
          transacoes: [...doBanco],
        });
      }
    }

    return lista;
  }

  private limparExtrato(): void {
    this.extratoPorDia = new Map();
    this.extratoNubankPorDia = new Set();
    this.extratoBbPorDia = new Set();
    this.emprestimoPorDia = new Set();
    this.emprestimosLoanPorDia = new Map();
    this.lembretesEmprestimoPorDia = new Map();
  }

  private atualizarEmprestimoPorDia(
    lembretes: PierrePaymentReminder[],
    emprestimosLoan: PierreTransacao[],
    dataInicio: string,
    dataFim: string,
  ): void {
    this.emprestimoPorDia = new Set();
    this.emprestimosLoanPorDia = new Map();
    this.lembretesEmprestimoPorDia = new Map();

    for (const [data, lista] of this.extratoPorDia) {
      if (!this.dataNoIntervalo(data, dataInicio, dataFim)) {
        continue;
      }
      if (lista.some((t) => isEmprestimoTransacaoPierre(t))) {
        this.emprestimoPorDia.add(data);
      }
    }

    for (const item of lembretes) {
      if (!isEmprestimoLembretePierre(item)) {
        continue;
      }
      const data = normalizarDataTransacaoPierre(item.dueDate);
      if (!data || !this.dataNoIntervalo(data, dataInicio, dataFim)) {
        continue;
      }
      this.emprestimoPorDia.add(data);
      const atual = this.lembretesEmprestimoPorDia.get(data) ?? [];
      atual.push(item);
      this.lembretesEmprestimoPorDia.set(data, atual);
    }

    for (const txn of emprestimosLoan) {
      const data = normalizarDataTransacaoPierre(txn.date);
      if (!data || !this.dataNoIntervalo(data, dataInicio, dataFim)) {
        continue;
      }
      if (isEmprestimoTransacaoPierre(txn)) {
        this.emprestimoPorDia.add(data);
        const atual = this.emprestimosLoanPorDia.get(data) ?? [];
        atual.push(txn);
        this.emprestimosLoanPorDia.set(data, atual);
      }
    }
  }

  private marcadoresEmprestimoCalendario(
    dataInicio: string,
    dataFim: string,
  ): CalendarioMarcadorDia[] {
    const lista: CalendarioMarcadorDia[] = [];

    for (const data of this.emprestimoPorDia) {
      if (!this.dataNoIntervalo(data, dataInicio, dataFim)) {
        continue;
      }
      const txns = this.obterTransacoesEmprestimoDoDia(data);
      const lembretes = this.obterLembretesEmprestimoDoDia(data);
      const valorTxn = txns.reduce((acc, t) => acc + paraNumeroTransacao(t.amount), 0);
      const valorLembrete = lembretes.reduce((acc, l) => acc + paraNumeroTransacao(l.amount), 0);
      const valor = txns.length > 0 ? valorTxn : valorLembrete;
      const futuro = lembretes.length > 0 && txns.length === 0;

      lista.push({
        id: `emprestimo-e-${data}`,
        titulo: futuro ? 'E · Empréstimo previsto' : 'E · Empréstimo',
        data,
        valor: valor || null,
        origem: 'emprestimo',
        transacoes: txns,
      });
    }

    return lista;
  }

  private agruparExtratoPorDia(transacoes: PierreTransacao[]): Map<string, PierreTransacao[]> {
    const mapa = new Map<string, PierreTransacao[]>();

    for (const txn of transacoes) {
      const data = normalizarDataTransacaoPierre(txn.date);
      if (!data) {
        continue;
      }
      const atual = mapa.get(data) ?? [];
      atual.push(txn);
      mapa.set(data, atual);
    }

    for (const [data, lista] of mapa) {
      lista.sort((a, b) => {
        const desc = descricaoTransacaoPierre(a).localeCompare(descricaoTransacaoPierre(b), 'pt-BR');
        if (desc !== 0) {
          return desc;
        }
        return paraNumeroTransacao(a.amount) - paraNumeroTransacao(b.amount);
      });
      mapa.set(data, lista);
    }

    this.atualizarExtratoPorBanco(mapa);
    return mapa;
  }

  private atualizarExtratoPorBanco(mapa: Map<string, PierreTransacao[]>): void {
    this.extratoNubankPorDia = new Set();
    this.extratoBbPorDia = new Set();

    for (const [data, lista] of mapa) {
      if (lista.some((t) => transacaoBancoPierre(t) === 'nubank')) {
        this.extratoNubankPorDia.add(data);
      }
      if (lista.some((t) => transacaoBancoPierre(t) === 'bb')) {
        this.extratoBbPorDia.add(data);
      }
    }
  }

  private mesclarMarcadores(
    lembretes: PierrePaymentReminder[],
    emprestimos: PierreTransacao[],
    dataInicio: string,
    dataFim: string,
  ): CalendarioMarcadorDia[] {
    const mapa = new Map<string, CalendarioMarcadorDia>();

    for (const item of lembretes) {
      if (isEmprestimoLembretePierre(item)) {
        continue;
      }
      const data = normalizarDataTransacaoPierre(item.dueDate);
      if (!data || !this.dataNoIntervalo(data, dataInicio, dataFim)) {
        continue;
      }
      const id = `lembrete-${item.id ?? `${data}-${item.title}`}`;
      mapa.set(id, {
        id,
        titulo: item.title?.trim() || 'Lembrete de pagamento',
        data,
        valor: paraNumeroTransacao(item.amount),
        origem: 'lembrete',
        status: item.status,
        isRecurring: item.isRecurring,
        recurrencePattern: item.recurrencePattern ?? null,
      });
    }

    for (const txn of emprestimos) {
      if (isEmprestimoTransacaoPierre(txn)) {
        continue;
      }
      const data = normalizarDataTransacaoPierre(txn.date);
      if (!data || !this.dataNoIntervalo(data, dataInicio, dataFim)) {
        continue;
      }
      const id = `loan-${txn.id ?? `${data}-${txn.description}`}`;
      if (mapa.has(id)) {
        continue;
      }
      const desc = txn.description?.trim() || 'Empréstimo';
      mapa.set(id, {
        id,
        titulo: desc,
        data,
        valor: paraNumeroTransacao(txn.amount),
        origem: 'emprestimo',
        status: txn.status,
      });
    }

    return [...mapa.values()];
  }

  private dataNoIntervalo(data: string, inicio: string, fim: string): boolean {
    return data >= inicio && data <= fim;
  }

  private diasNoIntervalo(dataInicioIso: string, dataFimIso: string): number {
    const inicio = this.parseIsoLocal(dataInicioIso);
    const fim = this.parseIsoLocal(dataFimIso);
    if (!inicio || !fim) {
      return 30;
    }
    return Math.ceil((fim.getTime() - inicio.getTime()) / 86_400_000) + 1;
  }

  private diasEntreHojeEFim(dataFimIso: string): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fim = this.parseIsoLocal(dataFimIso);
    if (!fim) {
      return 30;
    }
    const diff = Math.ceil((fim.getTime() - hoje.getTime()) / 86_400_000);
    return Math.min(Math.max(diff, 1), 366);
  }

  private parseIsoLocal(iso: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
    if (!m) {
      return null;
    }
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
}
