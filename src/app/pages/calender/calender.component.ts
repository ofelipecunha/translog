import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventInput,
  MoreLinkArg,
  type MoreLinkContentArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { CalendarioEventoModalsComponent } from '../../shared/components/calendario/calendario-evento-modals/calendario-evento-modals.component';
import {
  classeCorEvento,
  type CalendarioEventoItem,
} from '../../core/calendario-evento/calendario-evento.models';
import { CalendarioPierreMarcadoresService } from '../../core/pierre/calendario-pierre-marcadores.service';
import {
  CALENDARIO_BB_COR,
  CALENDARIO_MARCADOR_COR,
  CALENDARIO_NUBANK_COR,
  type CalendarioMarcadorDia,
} from '../../core/pierre/calendario-pierre-marcadores.models';
import { CalendarioExtratoDiaModalComponent } from '../../shared/components/calendario/calendario-extrato-dia-modal/calendario-extrato-dia-modal.component';
import { AlertNotificationService } from '../../shared/services/alert-notification.service';

interface CalendarEvent extends EventInput {
  extendedProps: {
    tipo: string;
    concluido: boolean;
    calendar: string;
    marcadorPierre?: boolean;
    marcadorDados?: CalendarioMarcadorDia;
  };
}

@Component({
  selector: 'app-calender',
  imports: [FullCalendarModule, CalendarioEventoModalsComponent, CalendarioExtratoDiaModalComponent],
  templateUrl: './calender.component.html',
  styles: `
    :host {
      display: block;
      overflow: hidden;
    }
  `,
})
export class CalenderComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('eventoModals') eventoModals!: CalendarioEventoModalsComponent;
  @ViewChild('extratoDiaModal') extratoDiaModal!: CalendarioExtratoDiaModalComponent;

  private readonly pierreMarcadores = inject(CalendarioPierreMarcadoresService);
  private readonly alerts = inject(AlertNotificationService);

  private eventosDb: CalendarEvent[] = [];
  private marcadoresPierre: CalendarEvent[] = [];

  listaCarregando = false;

  calendarOptions!: CalendarOptions;

  private readonly localePtBr = {
    ...ptBrLocale,
    moreLinkText: '+ Ver lançamentos',
  };

  ngOnInit(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      locale: this.localePtBr,
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next addEventButton',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      titleFormat: { year: 'numeric', month: 'long' },
      dayHeaderFormat: { weekday: 'short' },
      dayMaxEvents: 2,
      eventOrder: '-extendedProps.marcadorPierre,start',
      moreLinkClick: (info) => this.handleMoreLinkClick(info),
      dateClick: (info) => this.handleDateClick(info),
      selectable: true,
      events: [],
      select: (info) => this.handleDateSelect(info),
      eventClick: (info) => this.handleEventClick(info),
      datesSet: () => this.carregarCalendario(),
      customButtons: {
        addEventButton: {
          text: 'Adicionar evento +',
          click: () => this.eventoModals.abrirModalNovo(),
        },
      },
      eventContent: (arg) => this.renderEventContent(arg),
      moreLinkContent: (arg) => this.renderMoreLinkContent(arg),
    };
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.carregarCalendario());
  }

  onEventosAlterados(itens: CalendarioEventoItem[]): void {
    this.eventosDb = itens.map((item) => this.itemParaEvento(item));
    this.syncCalendarEvents();
  }

  private carregarCalendario(): void {
    const api = this.calendarComponent?.getApi();
    const range = api?.view?.activeStart && api?.view?.activeEnd
      ? { start: api.view.activeStart, end: api.view.activeEnd }
      : null;

    let dataInicio: string | undefined;
    let dataFim: string | undefined;
    if (range) {
      const fim = new Date(range.end);
      fim.setDate(fim.getDate() - 1);
      dataInicio = this.isoLocal(range.start);
      dataFim = this.isoLocal(fim);
    }

    this.eventoModals?.carregarEventos(dataInicio, dataFim);

    if (dataInicio && dataFim) {
      this.pierreMarcadores.carregarParaIntervalo(dataInicio, dataFim).subscribe({
        next: (lista) => {
          this.marcadoresPierre = lista.map((m) => this.marcadorParaEvento(m));
          this.syncCalendarEvents();
        },
        error: () => {
          this.marcadoresPierre = [];
          this.syncCalendarEvents();
        },
      });
    }
  }

  private itemParaEvento(item: CalendarioEventoItem): CalendarEvent {
    return {
      id: String(item.id),
      title: item.descricao,
      start: item.dataEvento,
      allDay: true,
      extendedProps: {
        tipo: item.tipo,
        concluido: item.concluido,
        calendar: classeCorEvento(item.tipo),
      },
    };
  }

  private marcadorParaEvento(m: CalendarioMarcadorDia): CalendarEvent {
    let cor = CALENDARIO_MARCADOR_COR;
    if (m.origem === 'extrato') {
      cor = m.banco === 'nubank' ? CALENDARIO_NUBANK_COR : CALENDARIO_BB_COR;
    } else if (m.id.startsWith('emprestimo-e-')) {
      cor = 'danger';
    }
    const titulo =
      m.origem === 'extrato' || m.id.startsWith('emprestimo-e-')
        ? m.titulo
        : (() => {
            const valorTxt =
              m.valor != null
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    Math.abs(m.valor),
                  )
                : '';
            return valorTxt ? `${m.titulo} · ${valorTxt}` : m.titulo;
          })();

    return {
      id: `pierre-${m.id}`,
      title: titulo,
      start: m.data,
      allDay: true,
      extendedProps: {
        tipo: m.origem === 'extrato' ? 'EXTRATO_PIERRE' : 'LEMBRETE_PAGAMENTO',
        concluido: false,
        calendar: cor,
        marcadorPierre: true,
        marcadorDados: m,
      },
    };
  }

  private syncCalendarEvents(): void {
    const todos = [...this.eventosDb, ...this.marcadoresPierre];
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...todos],
    };
    const api = this.calendarComponent?.getApi();
    api?.removeAllEvents();
    for (const ev of todos) {
      api?.addEvent(ev);
    }
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    this.eventoModals.abrirModalNovo(selectInfo.startStr.slice(0, 10));
  }

  handleDateClick(clickInfo: DateClickArg): void {
    const iso = clickInfo.dateStr.slice(0, 10);
    if (this.abrirExtratoSeHouver(iso)) {
      return;
    }
    if (this.eventoModals.contarEventosNaData(iso) > 1) {
      this.eventoModals.abrirModalListaDia(iso);
    } else if (this.eventoModals.contarEventosNaData(iso) === 1) {
      this.eventoModals.abrirDia(iso);
    }
  }

  handleMoreLinkClick(info: MoreLinkArg): void {
    info.jsEvent.preventDefault();
    this.eventoModals.abrirModalListaDia(this.isoLocal(info.date));
  }

  handleEventClick(clickInfo: EventClickArg): void {
    if (clickInfo.event.extendedProps['marcadorPierre']) {
      const dados = clickInfo.event.extendedProps['marcadorDados'] as CalendarioMarcadorDia;
      if (dados?.origem === 'extrato' || dados?.origem === 'emprestimo') {
        const iso = dados.data;
        const lista =
          dados.origem === 'emprestimo'
            ? this.pierreMarcadores.obterTransacoesEmprestimoDoDia(iso)
            : dados.transacoes?.length
              ? dados.transacoes
              : this.pierreMarcadores.obterTransacoesDoDia(iso, dados.banco);
        if (lista.length > 0) {
          this.extratoDiaModal.abrir(iso, lista);
        }
        return;
      }
      this.mostrarDetalheMarcadorPierre(dados, clickInfo.event.title ?? '');
      return;
    }
    const iso = (clickInfo.event.startStr ?? '').slice(0, 10);
    if (iso) {
      this.eventoModals.abrirDia(iso);
    }
  }

  private mostrarDetalheMarcadorPierre(dados: CalendarioMarcadorDia | undefined, titulo: string): void {
    if (!dados) {
      return;
    }
    const origem =
      dados.origem === 'lembrete' ? 'Lembrete de pagamento (Pierre)' : 'Movimentação de empréstimo (Pierre)';
    const valor =
      dados.valor != null
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            Math.abs(dados.valor),
          )
        : '—';
    const rec =
      dados.isRecurring && dados.recurrencePattern
        ? `Recorrente (${dados.recurrencePattern})`
        : dados.isRecurring
          ? 'Recorrente'
          : '';
    const msg = [origem, `Vencimento: ${this.formatarDataBr(dados.data)}`, `Valor: ${valor}`, rec]
      .filter(Boolean)
      .join('\n');
    this.alerts.info(titulo, msg, 8000);
  }

  renderMoreLinkContent(_arg: MoreLinkContentArg) {
    return {
      html: `
        <div class="cal-more-link-tarja">
          <span class="cal-more-link-tarja__stripe" aria-hidden="true"></span>
          <span class="cal-more-link-tarja__label">+ Ver lançamentos</span>
        </div>
      `,
    };
  }

  renderEventContent(eventInfo: EventContentArg) {
    const calendar = eventInfo.event.extendedProps['calendar'] as string;
    const concluido = !!eventInfo.event.extendedProps['concluido'];
    const colorClass = `fc-bg-${calendar?.toLowerCase() ?? 'primary'}`;
    const titulo = this.escapeHtml(eventInfo.event.title ?? '');
    const concluidoClass = concluido ? 'line-through opacity-70' : '';
    return {
      html: `
        <div class="event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm w-full">
          <div class="fc-daygrid-event-dot"></div>
          <div class="fc-event-title ${concluidoClass}">${titulo}</div>
        </div>
      `,
    };
  }

  private formatarDataBr(iso: string): string {
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) {
      return iso;
    }
    return `${d}/${m}/${y}`;
  }

  private escapeHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private isoLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private abrirExtratoSeHouver(iso: string): boolean {
    const emprestimos = this.pierreMarcadores.obterTransacoesEmprestimoDoDia(iso);
    if (emprestimos.length > 0) {
      this.extratoDiaModal.abrir(iso, emprestimos);
      return true;
    }
    const lista = this.pierreMarcadores.obterTransacoesDoDia(iso);
    if (lista.length === 0) {
      return false;
    }
    this.extratoDiaModal.abrir(iso, lista);
    return true;
  }
}
