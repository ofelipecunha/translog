import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { SelectComponent, type Option } from '../../shared/components/form/select/select.component';
import { IbgeLocalidadeService } from '../../core/geo/ibge-localidade.service';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { EmpresaService } from '../../core/empresa/empresa.service';
import { AlertNotificationService } from '../../shared/services/alert-notification.service';
import { BRASIL_ESTADOS } from '../../core/geo/brasil-estados';
import {
  type EmpresaLinha,
  mapearLinhaEmpresa,
  mensagemErroEmpresa,
} from '../../core/empresa/empresa.models';
import {
  cnpjSomenteDigitos,
  formatarCep,
  formatarCnpj,
  formatarTelefoneBr,
  isCepValido,
  isCnpjValido,
  isEmailValido,
  isTelefoneBrValido,
} from '../../core/validators/br-format.util';

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-empresas-page',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    BadgeComponent,
    ModalComponent,
    SelectComponent,
    ButtonComponent,
  ],
  templateUrl: './empresas-page.component.html',
})
export class EmpresasPageComponent implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly alerts = inject(AlertNotificationService);
  private readonly ibge = inject(IbgeLocalidadeService);

  readonly breadcrumbTrail = [{ label: 'Operações' }];
  readonly ativoOptions = [
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Não' },
  ];
  readonly estadoOptions = BRASIL_ESTADOS.map((e) => ({
    value: e.sigla,
    label: `${e.sigla} — ${e.nome}`,
  }));

  readonly loadingCidades = signal(false);
  readonly cidadeOptions = signal<Option[]>([]);

  readonly listaCarregando = signal(false);
  readonly listaErro = signal<string | null>(null);
  readonly excluindoId = signal<number | null>(null);
  readonly salvando = signal(false);
  readonly modalErro = signal<string | null>(null);
  readonly modalOpen = signal(false);
  readonly modalMode = signal<ModalMode>('create');
  readonly editandoId = signal<number | null>(null);

  filterNome = '';
  private readonly allRows = signal<EmpresaLinha[]>([]);

  readonly pageSize = 8;
  readonly currentPage = signal(1);

  formRazaoSocial = '';
  formNomeFantasia = '';
  formCnpj = '';
  formEmail = '';
  formTelefone = '';
  formEndereco = '';
  formNumero = '';
  formBairro = '';
  formCidade = '';
  formEstado = '';
  formCep = '';
  formAtivo = 'S';

  emailInvalido = false;
  telefoneInvalido = false;
  cnpjInvalido = false;
  cepInvalido = false;

  readonly paginatedRows = computed(() => {
    const rows = this.allRows();
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  });

  readonly totalFiltrado = computed(() => this.allRows().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalFiltrado() / this.pageSize)),
  );

  readonly startEntry = computed(() => {
    if (this.totalFiltrado() === 0) {
      return 0;
    }
    return (this.currentPage() - 1) * this.pageSize + 1;
  });

  readonly endEntry = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.totalFiltrado()),
  );

  readonly visiblePages = computed(() => {
    const maxVisible = 5;
    const total = this.totalPages();
    const current = Math.min(this.currentPage(), total);
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  readonly modalTitulo = computed(() =>
    this.modalMode() === 'create' ? 'Cadastrar empresa' : 'Editar empresa',
  );

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista(nome?: string): void {
    this.listaErro.set(null);
    this.listaCarregando.set(true);
    this.empresaService
      .listar(nome)
      .pipe(finalize(() => this.listaCarregando.set(false)))
      .subscribe({
        next: (lista) => {
          this.allRows.set(lista.map(mapearLinhaEmpresa));
          this.currentPage.set(1);
        },
        error: (err: unknown) => {
          const msg = mensagemErroEmpresa(err, 'listar');
          this.listaErro.set(msg);
          this.alerts.error('Erro ao listar', msg);
          this.allRows.set([]);
        },
      });
  }

  pesquisar(): void {
    this.carregarLista(this.filterNome);
  }

  abrirCadastro(): void {
    this.modalMode.set('create');
    this.editandoId.set(null);
    this.limparFormulario();
    this.modalErro.set(null);
    this.modalOpen.set(true);
  }

  abrirEdicao(row: EmpresaLinha): void {
    this.modalMode.set('edit');
    this.editandoId.set(row.id);
    this.modalErro.set(null);
    this.modalOpen.set(true);
    this.empresaService.porId(row.id).subscribe({
      next: (dto) => {
        this.formRazaoSocial = dto.razaoSocial;
        this.formNomeFantasia = dto.nomeFantasia ?? '';
        this.formCnpj = formatarCnpj(dto.cnpj);
        this.formEmail = dto.email ?? '';
        this.formTelefone = formatarTelefoneBr(dto.telefone ?? '');
        this.formEndereco = dto.endereco ?? '';
        this.formNumero = dto.numero ?? '';
        this.formBairro = dto.bairro ?? '';
        const uf = dto.estado?.trim().toUpperCase() ?? '';
        const cidade = dto.cidade ?? '';
        this.formEstado = uf;
        this.formCidade = cidade;
        this.formCep = formatarCep(dto.cep ?? '');
        if (uf) {
          this.carregarCidades(uf, cidade);
        } else {
          this.cidadeOptions.set([]);
        }
        this.formAtivo = (dto.ativo ?? 'S').trim().toUpperCase() === 'N' ? 'N' : 'S';
        this.emailInvalido = false;
        this.telefoneInvalido = false;
        this.cnpjInvalido = false;
        this.cepInvalido = false;
      },
      error: (err: unknown) => {
        const msg = mensagemErroEmpresa(err, 'carregar');
        this.modalErro.set(msg);
        this.alerts.error('Erro', msg);
      },
    });
  }

  fecharModal(): void {
    this.modalOpen.set(false);
    this.modalErro.set(null);
    this.emailInvalido = false;
    this.telefoneInvalido = false;
    this.cnpjInvalido = false;
    this.cepInvalido = false;
  }

  onCnpjInput(): void {
    this.formCnpj = formatarCnpj(this.formCnpj);
    this.modalErro.set(null);
    this.cnpjInvalido = !!this.formCnpj.trim() && !isCnpjValido(this.formCnpj);
  }

  onEmailInput(): void {
    this.modalErro.set(null);
    if (!this.formEmail.trim()) {
      this.emailInvalido = false;
      return;
    }
    this.emailInvalido = !isEmailValido(this.formEmail);
  }

  onTelefoneInput(): void {
    this.formTelefone = formatarTelefoneBr(this.formTelefone);
    this.modalErro.set(null);
    this.telefoneInvalido = !isTelefoneBrValido(this.formTelefone);
  }

  onCepInput(): void {
    this.formCep = formatarCep(this.formCep);
    this.modalErro.set(null);
    this.cepInvalido = !isCepValido(this.formCep);
  }

  salvarModal(): void {
    const razaoSocial = this.formRazaoSocial.trim();
    const nomeFantasia = this.formNomeFantasia.trim();
    const email = this.formEmail.trim();

    this.cnpjInvalido = !isCnpjValido(this.formCnpj);
    this.emailInvalido = !!email && !isEmailValido(email);
    this.telefoneInvalido = !isTelefoneBrValido(this.formTelefone);
    this.cepInvalido = !isCepValido(this.formCep);

    if (!razaoSocial) {
      this.modalErro.set('Informe a razão social.');
      return;
    }
    if (!nomeFantasia) {
      this.modalErro.set('Informe o nome fantasia.');
      return;
    }
    if (this.cnpjInvalido) {
      this.modalErro.set('Informe um CNPJ válido com 14 dígitos.');
      return;
    }
    if (this.emailInvalido) {
      this.modalErro.set('Informe um e-mail válido ou deixe o campo em branco.');
      return;
    }
    if (this.telefoneInvalido) {
      this.modalErro.set('Informe o telefone completo com DDD (10 ou 11 dígitos).');
      return;
    }
    if (this.cepInvalido) {
      this.modalErro.set('Informe o CEP completo (8 dígitos) ou deixe em branco.');
      return;
    }
    if (this.formEstado.trim() && !this.formCidade.trim()) {
      this.modalErro.set('Selecione a cidade para o estado escolhido.');
      return;
    }

    const payloadBase = {
      razaoSocial,
      nomeFantasia,
      cnpj: formatarCnpj(cnpjSomenteDigitos(this.formCnpj)),
      email: email || undefined,
      telefone: this.formTelefone.trim() || undefined,
      endereco: this.formEndereco.trim() || undefined,
      numero: this.formNumero.trim() || undefined,
      bairro: this.formBairro.trim() || undefined,
      cidade: this.formCidade.trim() || undefined,
      estado: this.formEstado.trim() || undefined,
      cep: this.formCep.trim() || undefined,
      ativo: this.formAtivo as 'S' | 'N',
    };

    this.salvando.set(true);
    this.modalErro.set(null);

    if (this.modalMode() === 'create') {
      this.empresaService
        .criar(payloadBase)
        .pipe(finalize(() => this.salvando.set(false)))
        .subscribe({
          next: () => {
            this.alerts.success('Cadastrado', 'Empresa criada com sucesso.');
            this.fecharModal();
            this.carregarLista(this.filterNome);
          },
          error: (err: unknown) => {
            const msg = mensagemErroEmpresa(err, 'cadastrar');
            this.modalErro.set(msg);
            this.alerts.error('Erro ao cadastrar', msg);
          },
        });
      return;
    }

    const id = this.editandoId();
    if (id == null) {
      this.salvando.set(false);
      return;
    }

    this.empresaService
      .atualizar(id, payloadBase)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.alerts.success('Atualizado', 'Empresa atualizada com sucesso.');
          this.fecharModal();
          this.carregarLista(this.filterNome);
        },
        error: (err: unknown) => {
          const msg = mensagemErroEmpresa(err, 'atualizar');
          this.modalErro.set(msg);
          this.alerts.error('Erro ao atualizar', msg);
        },
      });
  }

  confirmarExcluir(row: EmpresaLinha): void {
    if (!confirm(`Excluir a empresa "${row.razaoSocial}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    this.excluindoId.set(row.id);
    this.empresaService
      .excluir(row.id)
      .pipe(finalize(() => this.excluindoId.set(null)))
      .subscribe({
        next: () => {
          this.alerts.success('Excluído', `A empresa "${row.razaoSocial}" foi excluída.`);
          this.carregarLista(this.filterNome);
        },
        error: (err: unknown) => {
          const msg = mensagemErroEmpresa(err, 'excluir');
          this.listaErro.set(msg);
          this.alerts.error('Erro ao excluir', msg);
        },
      });
  }

  irParaPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.currentPage() - 1);
  }

  paginaProxima(): void {
    this.irParaPagina(this.currentPage() + 1);
  }

  onAtivoChange(value: string): void {
    this.formAtivo = value;
  }

  onEstadoChange(uf: string): void {
    this.formEstado = uf;
    this.formCidade = '';
    this.modalErro.set(null);
    if (uf) {
      this.carregarCidades(uf);
    } else {
      this.cidadeOptions.set([]);
    }
  }

  onCidadeChange(nome: string): void {
    this.formCidade = nome;
    this.modalErro.set(null);
  }

  private carregarCidades(uf: string, cidadeAtual?: string): void {
    this.loadingCidades.set(true);
    this.ibge.municipiosComoOpcoes(uf).subscribe({
      next: (opts) => {
        this.cidadeOptions.set(opts);
        if (cidadeAtual && opts.some((o) => o.value === cidadeAtual)) {
          this.formCidade = cidadeAtual;
        }
        this.loadingCidades.set(false);
      },
      error: () => {
        this.cidadeOptions.set([]);
        this.loadingCidades.set(false);
        this.modalErro.set('Não foi possível carregar as cidades. Verifique sua conexão.');
      },
    });
  }

  private limparFormulario(): void {
    this.formRazaoSocial = '';
    this.formNomeFantasia = '';
    this.formCnpj = '';
    this.formEmail = '';
    this.formTelefone = '';
    this.formEndereco = '';
    this.formNumero = '';
    this.formBairro = '';
    this.formCidade = '';
    this.formEstado = '';
    this.formCep = '';
    this.formAtivo = 'S';
    this.cidadeOptions.set([]);
    this.emailInvalido = false;
    this.telefoneInvalido = false;
    this.cnpjInvalido = false;
    this.cepInvalido = false;
  }
}
