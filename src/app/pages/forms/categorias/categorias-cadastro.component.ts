import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  PageBreadcrumbComponent,
  type PageBreadcrumbTrailItem,
} from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { FormCadastroActionsComponent } from '../../../shared/components/form/form-cadastro-actions/form-cadastro-actions.component';
import { CategoriaService } from '../../../core/categoria/categoria.service';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';
import {
  CATEGORIA_TIPO_OPCOES,
  mensagemErroCategoria,
  normalizarTipoCategoria,
  type CategoriaPayload,
} from '../../../core/categoria/categoria.models';

@Component({
  selector: 'app-categorias-cadastro',
  imports: [FormsModule, PageBreadcrumbComponent, FormCadastroActionsComponent],
  templateUrl: './categorias-cadastro.component.html',
})
export class CategoriasCadastroComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoriaService = inject(CategoriaService);
  private readonly alerts = inject(AlertNotificationService);

  readonly tipoOpcoes = CATEGORIA_TIPO_OPCOES;

  readonly registroId = signal<number | null>(null);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly erroMsg = signal<string | null>(null);

  nome = '';
  tipoSel: 'RECEITA' | 'DESPESA' | '' = '';
  ativo = true;

  readonly isEdicao = computed(() => this.registroId() != null);

  readonly pageTitle = computed(() =>
    this.isEdicao() ? 'Editar categoria' : 'Nova categoria',
  );

  readonly breadcrumbTrail = computed<PageBreadcrumbTrailItem[]>(() => [
    { label: 'Lançamentos' },
    { label: 'Categorias', link: '/categorias' },
  ]);

  get podeSalvar(): boolean {
    return (
      !!this.nome.trim() &&
      (this.tipoSel === 'RECEITA' || this.tipoSel === 'DESPESA')
    );
  }

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
    this.categoriaService
      .porId(id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (dto) => {
          this.nome = dto.nome;
          const t = normalizarTipoCategoria(dto.tipo);
          this.tipoSel = t === 'RECEITA' ? 'RECEITA' : 'DESPESA';
          this.ativo = dto.ativo;
        },
        error: (err: unknown) => {
          const msg = mensagemErroCategoria(err, 'listar');
          this.erroMsg.set(msg);
          this.alerts.error('Erro ao carregar', msg);
        },
      });
  }

  salvar(): void {
    const nomeTrim = this.nome.trim();
    if (!nomeTrim || !this.tipoSel) {
      return;
    }
    this.erroMsg.set(null);
    this.salvando.set(true);

    const payload: CategoriaPayload = {
      nome: nomeTrim,
      tipo: this.tipoSel,
      ativo: this.ativo,
    };

    const id = this.registroId();
    const req$ =
      id != null
        ? this.categoriaService.atualizar(id, payload)
        : this.categoriaService.criar(payload);

    const edicao = id != null;

    req$.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: () => {
        this.alerts.success(
          edicao ? 'Atualizado' : 'Salvo',
          edicao
            ? 'Categoria atualizada com sucesso.'
            : 'Categoria cadastrada com sucesso.',
        );
        this.router.navigate(['/categorias']);
      },
      error: (err: unknown) => {
        const msg = mensagemErroCategoria(err, 'salvar');
        this.erroMsg.set(msg);
        this.alerts.error('Erro ao salvar', msg);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/categorias']);
  }
}
