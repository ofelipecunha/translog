import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CalendarioEventoService } from '../../../../core/calendario-evento/calendario-evento.service';
import {
  CALENDARIO_TIPO_PADRAO,
  dtoParaCalendarioEventoItem,
  mensagemErroCalendarioEvento,
  type CalendarioEventoItem,
} from '../../../../core/calendario-evento/calendario-evento.models';
import { AlertNotificationService } from '../../../services/alert-notification.service';
import { ModalComponent } from '../../ui/modal/modal.component';

type EventoDiaResumo = {
  id: number;
  descricao: string;
  concluido: boolean;
};

@Component({
  selector: 'app-calendario-evento-modals',
  imports: [FormsModule, ModalComponent],
  templateUrl: './calendario-evento-modals.component.html',
})
export class CalendarioEventoModalsComponent {
  private readonly calendarioService = inject(CalendarioEventoService);
  private readonly alerts = inject(AlertNotificationService);

  @Output() eventosAlterados = new EventEmitter<CalendarioEventoItem[]>();
  @Output() carregandoAlterado = new EventEmitter<boolean>();

  eventos: CalendarioEventoItem[] = [];
  selectedEventId: number | null = null;

  descricao = '';
  dataEvento = '';
  tipo = CALENDARIO_TIPO_PADRAO;
  concluido = false;

  isOpen = false;
  isListaDiaOpen = false;
  salvando = false;
  excluindo = false;

  dataDiaListaIso = '';
  dataDiaListaLabel = '';
  eventosDiaLista: EventoDiaResumo[] = [];

  private ultimoFiltro: { dataInicio?: string; dataFim?: string } = {};

  get isEdicao(): boolean {
    return this.selectedEventId != null;
  }

  get podeSalvar(): boolean {
    return !!this.descricao.trim() && !!this.dataEvento.trim() && !this.salvando;
  }

  carregarEventos(dataInicio?: string, dataFim?: string): void {
    this.ultimoFiltro = { dataInicio, dataFim };
    this.carregandoAlterado.emit(true);
    this.calendarioService
      .listar({ dataInicio, dataFim })
      .pipe(finalize(() => this.carregandoAlterado.emit(false)))
      .subscribe({
        next: (lista) => {
          this.eventos = lista.map((dto) => dtoParaCalendarioEventoItem(dto));
          this.eventosAlterados.emit([...this.eventos]);
        },
        error: (err: unknown) => {
          this.alerts.error('Erro ao carregar', mensagemErroCalendarioEvento(err, 'listar'));
          this.eventos = [];
          this.eventosAlterados.emit([]);
        },
      });
  }

  contarEventosNaData(iso: string): number {
    return this.eventosNaData(iso).length;
  }

  abrirDia(iso: string): void {
    const eventos = this.eventosNaData(iso);
    if (eventos.length > 1) {
      this.abrirModalListaDia(iso);
      return;
    }
    if (eventos.length === 1) {
      const ev = eventos[0];
      this.selectedEventId = ev.id;
      this.descricao = ev.descricao;
      this.dataEvento = ev.dataEvento;
      this.tipo = ev.tipo;
      this.concluido = ev.concluido;
      this.openModal();
      return;
    }
    this.resetModalFields();
    this.dataEvento = iso;
    this.openModal();
  }

  abrirModalNovo(dataIso?: string): void {
    this.fecharModalListaDia();
    this.resetModalFields();
    this.dataEvento = dataIso ?? this.isoLocal(new Date());
    this.openModal();
  }

  abrirModalListaDia(iso: string): void {
    const eventos = this.eventosNaData(iso);
    if (eventos.length <= 1) {
      return;
    }
    this.dataDiaListaIso = iso;
    this.dataDiaListaLabel = this.formatarDataLabel(iso);
    this.eventosDiaLista = eventos.map((ev) => ({
      id: ev.id,
      descricao: ev.descricao,
      concluido: ev.concluido,
    }));
    this.isListaDiaOpen = true;
  }

  fecharModalListaDia(): void {
    this.isListaDiaOpen = false;
    this.eventosDiaLista = [];
    this.dataDiaListaIso = '';
    this.dataDiaListaLabel = '';
  }

  editarEventoDaLista(evento: EventoDiaResumo): void {
    const iso = this.dataDiaListaIso;
    this.fecharModalListaDia();
    this.selectedEventId = evento.id;
    this.descricao = evento.descricao;
    this.dataEvento = iso;
    this.tipo = CALENDARIO_TIPO_PADRAO;
    this.concluido = evento.concluido;
    this.openModal();
  }

  adicionarEventoNoDiaLista(): void {
    const iso = this.dataDiaListaIso;
    this.fecharModalListaDia();
    this.resetModalFields();
    this.dataEvento = iso;
    this.openModal();
  }

  salvar(): void {
    const descTrim = this.descricao.trim();
    if (!descTrim || !this.dataEvento) {
      return;
    }

    const payload = {
      descricao: descTrim,
      dataEvento: this.dataEvento,
      tipo: this.tipo || CALENDARIO_TIPO_PADRAO,
      concluido: this.concluido,
    };

    this.salvando = true;
    const id = this.selectedEventId;
    const req$ =
      id != null
        ? this.calendarioService.atualizar(id, payload)
        : this.calendarioService.criar(payload);

    req$.pipe(finalize(() => (this.salvando = false))).subscribe({
      next: () => {
        const edicao = id != null;
        const tituloEvento = descTrim;
        this.closeModal();
        this.recarregarUltimoIntervalo();
        if (edicao) {
          this.alerts.success(
            'Evento atualizado',
            `O evento "${tituloEvento}" foi atualizado com sucesso.`,
          );
        } else {
          this.alerts.success(
            'Evento adicionado',
            `O evento "${tituloEvento}" foi adicionado ao calendário.`,
          );
        }
      },
      error: (err: unknown) => {
        this.alerts.error('Erro ao salvar', mensagemErroCalendarioEvento(err, 'salvar'));
      },
    });
  }

  excluir(): void {
    const id = this.selectedEventId;
    if (id == null) {
      return;
    }
    if (!confirm('Excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }
    const tituloEvento = this.descricao.trim() || 'Evento';
    this.excluindo = true;
    this.calendarioService
      .excluir(id)
      .pipe(finalize(() => (this.excluindo = false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.recarregarUltimoIntervalo();
          this.alerts.success(
            'Evento excluído',
            `O evento "${tituloEvento}" foi removido do calendário.`,
          );
        },
        error: (err: unknown) => {
          this.alerts.error('Erro ao excluir', mensagemErroCalendarioEvento(err, 'excluir'));
        },
      });
  }

  private recarregarUltimoIntervalo(): void {
    const { dataInicio, dataFim } = this.ultimoFiltro;
    this.carregarEventos(dataInicio, dataFim);
  }

  resetModalFields(): void {
    this.descricao = '';
    this.dataEvento = '';
    this.tipo = CALENDARIO_TIPO_PADRAO;
    this.concluido = false;
    this.selectedEventId = null;
  }

  openModal(): void {
    this.fecharModalListaDia();
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
    this.resetModalFields();
  }

  private eventosNaData(iso: string): CalendarioEventoItem[] {
    return this.eventos
      .filter((ev) => ev.dataEvento === iso)
      .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'));
  }

  private formatarDataLabel(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  private isoLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
