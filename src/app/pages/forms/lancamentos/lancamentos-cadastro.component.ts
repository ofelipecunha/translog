import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs';
import {
  PageBreadcrumbComponent,
  type PageBreadcrumbTrailItem,
} from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { FormCadastroActionsComponent } from '../../../shared/components/form/form-cadastro-actions/form-cadastro-actions.component';
import { CategoriaService } from '../../../core/categoria/categoria.service';
import type { CategoriaApiDto } from '../../../core/categoria/categoria.models';
import { FormaPagamentoService } from '../../../core/forma-pagamento/forma-pagamento.service';
import type { FormaPagamentoApiDto } from '../../../core/forma-pagamento/forma-pagamento.models';
import { LancamentoService } from '../../../core/lancamento/lancamento.service';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';
import {
  LANCAMENTO_TIPO_OPCOES,
  isoHojeLocal,
  mensagemErroLancamento,
  normalizarLancamento,
  normalizarLocalDateParaIso,
  type LancamentoPayload,
} from '../../../core/lancamento/lancamento.models';

@Component({
  selector: 'app-lancamentos-cadastro',
  imports: [FormsModule, PageBreadcrumbComponent, FormCadastroActionsComponent],
  templateUrl: './lancamentos-cadastro.component.html',
})
export class LancamentosCadastroComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly lancamentoService = inject(LancamentoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly formaPagamentoService = inject(FormaPagamentoService);
  private readonly alerts = inject(AlertNotificationService);

  readonly tipoOpcoes = LANCAMENTO_TIPO_OPCOES;

  readonly registroId = signal<number | null>(null);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly erroMsg = signal<string | null>(null);
  readonly refsCarregados = signal(false);
  readonly erroRefs = signal<string | null>(null);

  categoriasOpcoes: CategoriaApiDto[] = [];
  formasOpcoes: FormaPagamentoApiDto[] = [];

  descricao = '';
  valor: number | null = null;
  dataLancamento = '';
  categoriaSel: number | null = null;
  formaSel: number | null = null;
  tipoSel: 'RECEITA' | 'DESPESA' | '' = '';
  pago = false;

  readonly isEdicao = computed(() => this.registroId() != null);

  readonly pageTitle = computed(() =>
    this.isEdicao() ? 'Editar lançamento' : 'Novo lançamento',
  );

  readonly breadcrumbTrail = computed<PageBreadcrumbTrailItem[]>(() => [
    { label: 'Lançamentos', link: '/lancamentos' },
  ]);

  get podeSalvar(): boolean {
    if (!this.refsCarregados() || this.salvando() || this.carregando()) {
      return false;
    }
    const v = this.valor;
    return (
      this.categoriaSel != null &&
      this.categoriaSel > 0 &&
      this.dataLancamento.trim().length > 0 &&
      (this.tipoSel === 'RECEITA' || this.tipoSel === 'DESPESA') &&
      v != null &&
      Number.isFinite(v) &&
      v > 0
    );
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    forkJoin({
      categorias: this.categoriaService.listar(),
      formas: this.formaPagamentoService.listar(),
    }).subscribe({
      next: ({ categorias, formas }) => {
        this.categoriasOpcoes = categorias.filter((c) => c.ativo);
        this.formasOpcoes = formas.filter((f) => f.ativo);
        this.refsCarregados.set(true);

        if (idParam) {
          const id = Number(idParam);
          if (Number.isFinite(id) && id > 0) {
            this.registroId.set(id);
            this.carregarRegistro(id);
            return;
          }
        }
        this.registroId.set(null);
        this.dataLancamento = isoHojeLocal();
      },
      error: () => {
        this.erroRefs.set('Não foi possível carregar categorias ou formas de pagamento.');
      },
    });
  }

  private carregarRegistro(id: number): void {
    this.erroMsg.set(null);
    this.carregando.set(true);
    this.lancamentoService
      .porId(id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (dto) => {
          const r = normalizarLancamento(dto);
          this.descricao = r.descricao ?? '';
          this.valor = r.valor;
          this.dataLancamento = normalizarLocalDateParaIso(r.dataLancamento);
          this.categoriaSel = r.categoriaId;
          this.formaSel =
            r.formaPagamentoId != null && r.formaPagamentoId > 0 ? r.formaPagamentoId : null;
          const rawT = (r.tipo ?? '').trim();
          const up = rawT.toUpperCase();
          if (rawT === 'tipoStreaming' || up === 'TIPOSTREAMING') {
            this.tipoSel = 'DESPESA';
          } else {
            this.tipoSel = up === 'RECEITA' ? 'RECEITA' : 'DESPESA';
          }
          this.pago = r.pago;
        },
        error: (err: unknown) => {
          const msg = mensagemErroLancamento(err, 'listar');
          this.erroMsg.set(msg);
          this.alerts.error('Erro ao carregar', msg);
        },
      });
  }

  salvar(): void {
    if (!this.podeSalvar) {
      return;
    }
    this.erroMsg.set(null);
    this.salvando.set(true);

    const descTrim = this.descricao.trim();
    const payload: LancamentoPayload = {
      descricao: descTrim.length ? descTrim : null,
      valor: this.valor as number,
      dataLancamento: this.dataLancamento,
      categoriaId: this.categoriaSel as number,
      tipo: this.tipoSel as 'RECEITA' | 'DESPESA',
      formaPagamentoId:
        this.formaSel != null && this.formaSel > 0 ? this.formaSel : null,
      pago: this.pago,
    };

    const id = this.registroId();
    const req$ =
      id != null
        ? this.lancamentoService.atualizar(id, payload)
        : this.lancamentoService.criar(payload);

    const edicao = id != null;

    req$.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: () => {
        this.alerts.success(
          edicao ? 'Atualizado' : 'Salvo',
          edicao
            ? 'Lançamento atualizado com sucesso.'
            : 'Lançamento cadastrado com sucesso.',
        );
        this.router.navigate(['/lancamentos']);
      },
      error: (err: unknown) => {
        const msg = mensagemErroLancamento(err, 'salvar');
        this.erroMsg.set(msg);
        this.alerts.error('Erro ao salvar', msg);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/lancamentos']);
  }
}
