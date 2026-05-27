import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  PageBreadcrumbComponent,
  type PageBreadcrumbTrailItem,
} from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { FormCadastroActionsComponent } from '../../../shared/components/form/form-cadastro-actions/form-cadastro-actions.component';
import { FormaPagamentoService } from '../../../core/forma-pagamento/forma-pagamento.service';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';
import {
  FORMA_PAGAMENTO_TIPO_OPCOES,
  formatarDataCriacao,
  mensagemErroApi,
  type FormaPagamentoPayload,
} from '../../../core/forma-pagamento/forma-pagamento.models';

@Component({
  selector: 'app-formas-pagamento-cadastro',
  imports: [FormsModule, PageBreadcrumbComponent, FormCadastroActionsComponent],
  templateUrl: './formas-pagamento-cadastro.component.html',
})
export class FormasPagamentoCadastroComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formaPagamentoService = inject(FormaPagamentoService);
  private readonly alerts = inject(AlertNotificationService);

  readonly tipoOpcoes = FORMA_PAGAMENTO_TIPO_OPCOES;

  readonly registroId = signal<number | null>(null);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly erroMsg = signal<string | null>(null);
  readonly dataCriacaoExibicao = signal<string | null>(null);

  nome = '';
  tipoSel = '';
  ativo = true;

  readonly isEdicao = computed(() => this.registroId() != null);

  readonly pageTitle = computed(() =>
    this.isEdicao() ? 'Editar forma de pagamento' : 'Nova forma de pagamento',
  );

  readonly breadcrumbTrail = computed<PageBreadcrumbTrailItem[]>(() => [
    { label: 'Lançamentos' },
    { label: 'Formas de Pagamento', link: '/formas-pagamento' },
  ]);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (Number.isFinite(id) && id > 0) {
        this.registroId.set(id);
        this.carregarRegistro(id);
        return;
      }
    }
    this.registroId.set(null);
  }

  private carregarRegistro(id: number): void {
    this.erroMsg.set(null);
    this.carregando.set(true);
    this.formaPagamentoService
      .porId(id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (dto) => {
          this.nome = dto.nome;
          this.tipoSel = dto.tipo ?? '';
          this.ativo = dto.ativo;
          this.dataCriacaoExibicao.set(formatarDataCriacao(dto.dataCriacao));
        },
        error: (err: unknown) => {
          const msg = mensagemErroApi(err, 'listar');
          this.erroMsg.set(msg);
          this.alerts.error('Erro ao carregar', msg);
        },
      });
  }

  salvar(): void {
    const nomeTrim = this.nome.trim();
    if (!nomeTrim) {
      return;
    }
    this.erroMsg.set(null);
    this.salvando.set(true);

    const payload: FormaPagamentoPayload = {
      nome: nomeTrim,
      tipo: this.tipoSel.trim() ? this.tipoSel.trim().toUpperCase() : null,
      ativo: this.ativo,
    };

    const id = this.registroId();
    const req$ =
      id != null
        ? this.formaPagamentoService.atualizar(id, payload)
        : this.formaPagamentoService.criar(payload);

    const edicao = id != null;

    req$.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: () => {
        this.alerts.success(
          edicao ? 'Atualizado' : 'Salvo',
          edicao
            ? 'Forma de pagamento atualizada com sucesso.'
            : 'Forma de pagamento cadastrada com sucesso.',
        );
        this.router.navigate(['/formas-pagamento']);
      },
      error: (err: unknown) => {
        const msg = mensagemErroApi(err, 'salvar');
        this.erroMsg.set(msg);
        this.alerts.error('Erro ao salvar', msg);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/formas-pagamento']);
  }
}
