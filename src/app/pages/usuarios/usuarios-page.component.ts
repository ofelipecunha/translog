import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { SelectComponent } from '../../shared/components/form/select/select.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { UsuarioService } from '../../core/usuario/usuario.service';
import { AlertNotificationService } from '../../shared/services/alert-notification.service';
import {
  PERFIS_USUARIO,
  type PerfilUsuarioCodigo,
  type UsuarioLinha,
  mapearLinhaUsuario,
  mensagemErroUsuario,
} from '../../core/usuario/usuario.models';
import {
  formatarTelefoneBr,
  isEmailValido,
  isTelefoneBrValido,
  telefoneSomenteDigitos,
} from '../../core/validators/br-format.util';

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-usuarios-page',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    BadgeComponent,
    ModalComponent,
    SelectComponent,
    ButtonComponent,
  ],
  templateUrl: './usuarios-page.component.html',
})
export class UsuariosPageComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly alerts = inject(AlertNotificationService);

  readonly breadcrumbTrail = [{ label: 'Sistema' }];
  readonly perfilOptions = PERFIS_USUARIO.map((p) => ({ value: p.value, label: p.label }));
  readonly ativoOptions = [
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Não' },
  ];

  readonly listaCarregando = signal(false);
  readonly listaErro = signal<string | null>(null);
  readonly excluindoId = signal<number | null>(null);
  readonly salvando = signal(false);
  readonly modalErro = signal<string | null>(null);

  readonly modalOpen = signal(false);
  readonly modalMode = signal<ModalMode>('create');
  readonly editandoId = signal<number | null>(null);

  readonly exclusaoModalOpen = signal(false);
  readonly usuarioParaExcluir = signal<UsuarioLinha | null>(null);

  filterNome = '';
  private readonly allRows = signal<UsuarioLinha[]>([]);

  readonly pageSize = 8;
  readonly currentPage = signal(1);

  formNome = '';
  formLogin = '';
  formEmail = '';
  formSenha = '';
  formTelefone = '';
  formPerfil: PerfilUsuarioCodigo = 'USUARIO';
  formAtivo = 'S';

  emailInvalido = false;
  telefoneInvalido = false;

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
    this.modalMode() === 'create' ? 'Cadastrar usuário' : 'Editar usuário',
  );

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista(nome?: string): void {
    this.listaErro.set(null);
    this.listaCarregando.set(true);
    this.usuarioService
      .listar(nome)
      .pipe(finalize(() => this.listaCarregando.set(false)))
      .subscribe({
        next: (lista) => {
          this.allRows.set(lista.map(mapearLinhaUsuario));
          this.currentPage.set(1);
        },
        error: (err: unknown) => {
          const msg = mensagemErroUsuario(err, 'listar');
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

  abrirEdicao(row: UsuarioLinha): void {
    this.modalMode.set('edit');
    this.editandoId.set(row.id);
    this.modalErro.set(null);
    this.modalOpen.set(true);
    this.usuarioService.porId(row.id).subscribe({
      next: (dto) => {
        this.formNome = dto.nome;
        this.formLogin = dto.login;
        this.formEmail = dto.email;
        this.formSenha = '';
        this.formTelefone = formatarTelefoneBr(dto.telefone ?? '');
        this.emailInvalido = false;
        this.telefoneInvalido = false;
        this.formPerfil = (dto.perfil?.toUpperCase() ?? 'USUARIO') as PerfilUsuarioCodigo;
        this.formAtivo = (dto.ativo ?? 'S').trim().toUpperCase() === 'N' ? 'N' : 'S';
      },
      error: (err: unknown) => {
        const msg = mensagemErroUsuario(err, 'carregar');
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

  salvarModal(): void {
    const nome = this.formNome.trim();
    const login = this.formLogin.trim();
    const email = this.formEmail.trim();
    this.emailInvalido = !!email && !isEmailValido(email);
    this.telefoneInvalido = !isTelefoneBrValido(this.formTelefone);

    if (!nome || !login || !email) {
      this.modalErro.set('Preencha nome, login e e-mail.');
      return;
    }
    if (this.emailInvalido) {
      this.modalErro.set('Informe um e-mail válido (ex.: nome@empresa.com.br).');
      return;
    }
    if (this.telefoneInvalido) {
      this.modalErro.set('Informe o telefone completo com DDD (10 ou 11 dígitos).');
      return;
    }
    if (this.modalMode() === 'create' && !this.formSenha.trim()) {
      this.modalErro.set('Informe a senha do novo usuário.');
      return;
    }
    if (this.formSenha.trim() && this.formSenha.trim().length < 6) {
      this.modalErro.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (!PERFIS_USUARIO.some((p) => p.value === this.formPerfil)) {
      this.modalErro.set('Selecione um perfil válido.');
      return;
    }

    this.salvando.set(true);
    this.modalErro.set(null);

    if (this.modalMode() === 'create') {
      this.usuarioService
        .criar({
          nome,
          login,
          email,
          senha: this.formSenha.trim(),
          telefone: telefoneSomenteDigitos(this.formTelefone) || undefined,
          perfil: this.formPerfil,
          ativo: this.formAtivo as 'S' | 'N',
        })
        .pipe(finalize(() => this.salvando.set(false)))
        .subscribe({
          next: () => {
            this.alerts.success('Cadastrado', 'Usuário criado com sucesso.');
            this.fecharModal();
            this.carregarLista(this.filterNome);
          },
          error: (err: unknown) => {
            const msg = mensagemErroUsuario(err, 'cadastrar');
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

    const payload = {
      nome,
      login,
      email,
      telefone: telefoneSomenteDigitos(this.formTelefone) || undefined,
      perfil: this.formPerfil,
      ativo: this.formAtivo as 'S' | 'N',
      ...(this.formSenha.trim() ? { senha: this.formSenha.trim() } : {}),
    };

    this.usuarioService
      .atualizar(id, payload)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.alerts.success('Atualizado', 'Usuário atualizado com sucesso.');
          this.fecharModal();
          this.carregarLista(this.filterNome);
        },
        error: (err: unknown) => {
          const msg = mensagemErroUsuario(err, 'atualizar');
          this.modalErro.set(msg);
          this.alerts.error('Erro ao atualizar', msg);
        },
      });
  }

  abrirModalExclusao(row: UsuarioLinha): void {
    this.usuarioParaExcluir.set(row);
    this.exclusaoModalOpen.set(true);
  }

  fecharModalExclusao(): void {
    if (this.excluindoId() != null) {
      return;
    }
    this.exclusaoModalOpen.set(false);
    this.usuarioParaExcluir.set(null);
  }

  confirmarExclusao(): void {
    const row = this.usuarioParaExcluir();
    if (!row) {
      return;
    }
    this.excluindoId.set(row.id);
    this.usuarioService
      .excluir(row.id)
      .pipe(finalize(() => this.excluindoId.set(null)))
      .subscribe({
        next: () => {
          this.alerts.success('Excluído', `O usuário "${row.nome}" foi excluído.`);
          this.exclusaoModalOpen.set(false);
          this.usuarioParaExcluir.set(null);
          this.carregarLista(this.filterNome);
        },
        error: (err: unknown) => {
          const msg = mensagemErroUsuario(err, 'excluir');
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

  onPerfilChange(value: string): void {
    this.formPerfil = value as PerfilUsuarioCodigo;
  }

  onAtivoChange(value: string): void {
    this.formAtivo = value;
  }

  private limparFormulario(): void {
    this.formNome = '';
    this.formLogin = '';
    this.formEmail = '';
    this.formSenha = '';
    this.formTelefone = '';
    this.formPerfil = 'USUARIO';
    this.formAtivo = 'S';
    this.emailInvalido = false;
    this.telefoneInvalido = false;
  }
}
