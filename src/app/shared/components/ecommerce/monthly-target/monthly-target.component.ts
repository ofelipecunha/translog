
import { NgClass } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CalendarioEventoModalsComponent } from '../../calendario/calendario-evento-modals/calendario-evento-modals.component';
import type { CalendarioEventoItem } from '../../../../core/calendario-evento/calendario-evento.models';
import { CalendarioPierreMarcadoresService } from '../../../../core/pierre/calendario-pierre-marcadores.service';
import { CalendarioExtratoDiaModalComponent } from '../../calendario/calendario-extrato-dia-modal/calendario-extrato-dia-modal.component';

type CalendarCell = {
  day: number | null;
  isToday: boolean;
  iso: string | null;
  eventCount: number;
  temLancamentoNubank: boolean;
  temLancamentoBb: boolean;
  temEmprestimo: boolean;
};

@Component({
  selector: 'app-monthly-target',
  imports: [NgClass, CalendarioEventoModalsComponent, CalendarioExtratoDiaModalComponent],
  templateUrl: './monthly-target.component.html',
    styles: `
    .cal-filtro-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid #e4e7ec;
      border-radius: 9999px;
      background-color: #fff;
      padding: 0.375rem 0.75rem;
      font-size: 0.6875rem;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: 0.02em;
      color: #1d2939;
      white-space: nowrap;
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease,
        box-shadow 0.15s ease;
    }

    .cal-filtro-pill:hover {
      border-color: #d0d5dd;
      background-color: #f9fafb;
    }

    .cal-filtro-pill--ativo {
      border-color: #98a2b3;
      background-color: #f2f4f7;
      box-shadow: inset 0 0 0 1px #d0d5dd;
    }

    :host-context(.dark) .cal-filtro-pill {
      border-color: #475467;
      background-color: #1d2939;
      color: #f2f4f7;
    }

    :host-context(.dark) .cal-filtro-pill:hover {
      border-color: #667085;
      background-color: #344054;
    }

    :host-context(.dark) .cal-filtro-pill--ativo {
      border-color: #98a2b3;
      background-color: #344054;
      box-shadow: inset 0 0 0 1px #667085;
    }

    .cal-filtro-pill-icone {
      flex-shrink: 0;
    }

    .cal-filtro-pill-icone--evento {
      height: 0.5rem;
      width: 0.5rem;
      border-radius: 9999px;
      background-color: #22c55e;
    }

    .cal-filtro-pill-icone--bb {
      height: 0.375rem;
      width: 1rem;
      border-radius: 9999px;
      background-color: #f97316;
    }

    .cal-filtro-pill-icone--nubank {
      height: 0.375rem;
      width: 1rem;
      border-radius: 9999px;
      background-color: #820ad1;
    }

    .cal-dia-btn {
      width: 100%;
      min-width: 0;
    }

    .cal-dia-marcadores {
      position: absolute;
      bottom: 0.125rem;
      left: 50%;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.0625rem;
      pointer-events: none;
      transform: translateX(-50%);
    }

    .cal-dia-tarjas {
      display: flex;
      width: 1.75rem;
      flex-direction: column;
      align-items: stretch;
      gap: 0.125rem;
    }

    .cal-dia-tarja {
      display: block;
      flex-shrink: 0;
      width: 1.75rem;
      height: 0.25rem;
      border-radius: 9999px;
    }

    .cal-dia-tarja--nubank {
      background-color: #820ad1;
    }

    .cal-dia-tarja--bb {
      background-color: #fdfc30;
    }

    .cal-dia-evento {
      position: absolute;
      left: 50%;
      height: 0.375rem;
      width: 0.375rem;
      transform: translateX(-50%);
      border-radius: 9999px;
      background-color: #22c55e;
    }

    .cal-dia-evento--1-tarja {
      bottom: 0.875rem;
    }

    .cal-dia-evento--2-tarjas {
      bottom: 1.25rem;
    }

    .cal-dia-evento--sem-tarja {
      bottom: 0.25rem;
    }

    .cal-dia-evento--1-tarja-emprestimo {
      bottom: 1.125rem;
    }

    .cal-dia-evento--2-tarjas-emprestimo {
      bottom: 1.5rem;
    }

    .cal-dia-evento--so-emprestimo {
      bottom: 0.625rem;
    }

    .cal-dia-emprestimo {
      font-size: 0.5rem;
      font-weight: 700;
      line-height: 1;
      color: #16a34a;
    }

    :host-context(.dark) .cal-dia-emprestimo {
      color: #f87171;
    }

    .cal-dia--hoje .cal-dia-emprestimo {
      color: #86efac;
    }

    :host-context(.dark) .cal-dia--hoje .cal-dia-emprestimo {
      color: #fecaca;
    }

    .cal-dia--hoje .cal-dia-evento {
      background-color: #fff;
    }
  `,
})
export class MonthlyTargetComponent implements OnInit, AfterViewInit {
  @ViewChild('eventoModals') eventoModals!: CalendarioEventoModalsComponent;
  @ViewChild('extratoDiaModal') extratoDiaModal!: CalendarioExtratoDiaModalComponent;

  private readonly pierreMarcadores = inject(CalendarioPierreMarcadoresService);

  monthYearLabel = '';
  readonly weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarWeeks: CalendarCell[][] = [];

  private viewYear = 0;
  private viewMonth = 0;
  private eventosPorDia = new Map<string, number>();
  private extratoNubankPorDia = new Set<string>();
  private extratoBbPorDia = new Set<string>();
  private emprestimoPorDia = new Set<string>();

  /** Sem nenhum marcado: calendário limpo. Com um ou mais: só os tipos selecionados. */
  filtroEventos = false;
  filtroBb = false;
  filtroNubank = false;

  get filtrosMarcadoresAtivos(): boolean {
    return this.filtroEventos || this.filtroBb || this.filtroNubank;
  }

  /** Ponto verde (eventos do calendário) */
  mostrarMarcadorEvento(cell: CalendarCell): boolean {
    return this.filtrosMarcadoresAtivos && this.filtroEventos && cell.eventCount > 0;
  }

  mostrarTarjaNubank(cell: CalendarCell): boolean {
    return this.filtrosMarcadoresAtivos && this.filtroNubank && cell.temLancamentoNubank;
  }

  mostrarTarjaBb(cell: CalendarCell): boolean {
    return this.filtrosMarcadoresAtivos && this.filtroBb && cell.temLancamentoBb;
  }

  /** E de empréstimo: visível com filtro BB ou Nubank (lançamentos bancários). */
  mostrarEmprestimo(cell: CalendarCell): boolean {
    return (
      cell.temEmprestimo &&
      this.filtrosMarcadoresAtivos &&
      (this.filtroBb || this.filtroNubank)
    );
  }

  ngOnInit(): void {
    this.buildCalendar(new Date());
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.carregarEventosDoMes());
  }

  onEventosAlterados(eventos: CalendarioEventoItem[]): void {
    this.eventosPorDia.clear();
    for (const ev of eventos) {
      const n = this.eventosPorDia.get(ev.dataEvento) ?? 0;
      this.eventosPorDia.set(ev.dataEvento, n + 1);
    }
    this.atualizarContagensNasCelulas();
  }

  onDiaClick(cell: CalendarCell, event: Event): void {
    event.stopPropagation();
    if (!cell.iso) {
      return;
    }
    if (cell.temEmprestimo) {
      const emprestimos = this.pierreMarcadores.obterTransacoesEmprestimoDoDia(cell.iso);
      if (emprestimos.length > 0) {
        this.extratoDiaModal.abrir(cell.iso, emprestimos);
        return;
      }
    }
    if (cell.temLancamentoNubank || cell.temLancamentoBb) {
      const lista = this.pierreMarcadores.obterTransacoesDoDia(cell.iso);
      if (lista.length > 0) {
        this.extratoDiaModal.abrir(cell.iso, lista);
        return;
      }
    }
    this.eventoModals.abrirDia(cell.iso);
  }

  classeEventoDot(cell: CalendarCell): string {
    const tarjas =
      (this.mostrarTarjaNubank(cell) ? 1 : 0) + (this.mostrarTarjaBb(cell) ? 1 : 0);
    if (this.mostrarEmprestimo(cell)) {
      if (tarjas >= 2) {
        return 'cal-dia-evento--2-tarjas-emprestimo';
      }
      if (tarjas === 1) {
        return 'cal-dia-evento--1-tarja-emprestimo';
      }
      return 'cal-dia-evento--so-emprestimo';
    }
    if (tarjas >= 2) {
      return 'cal-dia-evento--2-tarjas';
    }
    if (tarjas === 1) {
      return 'cal-dia-evento--1-tarja';
    }
    return 'cal-dia-evento--sem-tarja';
  }

  private carregarEventosDoMes(): void {
    const dataInicio = this.isoDoDia(this.viewYear, this.viewMonth, 1);
    const ultimoDia = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const dataFim = this.isoDoDia(this.viewYear, this.viewMonth, ultimoDia);
    this.eventoModals?.carregarEventos(dataInicio, dataFim);
    this.pierreMarcadores.carregarParaIntervalo(dataInicio, dataFim).subscribe({
      next: () => {
        this.extratoNubankPorDia = new Set();
        this.extratoBbPorDia = new Set();
        this.emprestimoPorDia = new Set();
        for (let d = 1; d <= ultimoDia; d++) {
          const iso = this.isoDoDia(this.viewYear, this.viewMonth, d);
          if (this.pierreMarcadores.temExtratoNubankNoDia(iso)) {
            this.extratoNubankPorDia.add(iso);
          }
          if (this.pierreMarcadores.temExtratoBbNoDia(iso)) {
            this.extratoBbPorDia.add(iso);
          }
          if (this.pierreMarcadores.temEmprestimoNoDia(iso)) {
            this.emprestimoPorDia.add(iso);
          }
        }
        this.atualizarContagensNasCelulas();
      },
      error: () => {
        this.extratoNubankPorDia = new Set();
        this.extratoBbPorDia = new Set();
        this.emprestimoPorDia = new Set();
        this.atualizarContagensNasCelulas();
      },
    });
  }

  private celulaVazia(): CalendarCell {
    return {
      day: null,
      isToday: false,
      iso: null,
      eventCount: 0,
      temLancamentoNubank: false,
      temLancamentoBb: false,
      temEmprestimo: false,
    };
  }

  private buildCalendar(reference: Date): void {
    const year = reference.getFullYear();
    const month = reference.getMonth();
    const hoje = new Date();
    const isMesAtual = hoje.getFullYear() === year && hoje.getMonth() === month;

    this.viewYear = year;
    this.viewMonth = month;

    const firstOfMonth = new Date(year, month, 1);
    this.monthYearLabel = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(firstOfMonth);
    this.monthYearLabel =
      this.monthYearLabel.charAt(0).toUpperCase() + this.monthYearLabel.slice(1);

    const lastOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();
    const startWeekday = firstOfMonth.getDay();

    const weeks: CalendarCell[][] = [];
    let row: CalendarCell[] = [];

    for (let i = 0; i < startWeekday; i++) {
      row.push(this.celulaVazia());
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = this.isoDoDia(year, month, d);
      row.push({
        day: d,
        isToday: isMesAtual && d === hoje.getDate(),
        iso,
        eventCount: this.eventosPorDia.get(iso) ?? 0,
        temLancamentoNubank: this.extratoNubankPorDia.has(iso),
        temLancamentoBb: this.extratoBbPorDia.has(iso),
        temEmprestimo: this.emprestimoPorDia.has(iso),
      });
      if (row.length === 7) {
        weeks.push(row);
        row = [];
      }
    }

    if (row.length > 0) {
      while (row.length < 7) {
        row.push(this.celulaVazia());
      }
      weeks.push(row);
    }

    this.calendarWeeks = weeks;
  }

  private atualizarContagensNasCelulas(): void {
    this.calendarWeeks = this.calendarWeeks.map((week) =>
      week.map((cell) =>
        cell.iso
          ? {
              ...cell,
              eventCount: this.eventosPorDia.get(cell.iso) ?? 0,
              temLancamentoNubank: this.extratoNubankPorDia.has(cell.iso),
              temLancamentoBb: this.extratoBbPorDia.has(cell.iso),
              temEmprestimo: this.emprestimoPorDia.has(cell.iso),
            }
          : cell,
      ),
    );
  }

  private isoDoDia(year: number, month: number, day: number): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }
}
