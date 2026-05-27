import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';
import { ControleAcessoService } from '../../../core/acesso/controle-acesso.service';
import {
  PERFIS_USUARIO,
  TELAS_ACESSO,
  TelaAcessoId,
} from '../../../core/acesso/tela-acesso.model';
import { PerfilUsuarioCodigo } from '../../../core/usuario/usuario.models';

@Component({
  selector: 'app-controle-acesso-page',
  imports: [FormsModule, NgClass, PageBreadcrumbComponent],
  templateUrl: './controle-acesso-page.component.html',
})
export class ControleAcessoPageComponent {
  private readonly acesso = inject(ControleAcessoService);
  private readonly alertas = inject(AlertNotificationService);

  readonly breadcrumbTrail = [{ label: 'Sistema' }];
  readonly perfis = PERFIS_USUARIO;
  readonly telas = TELAS_ACESSO;

  readonly perfilSelecionado = signal<PerfilUsuarioCodigo>('MOTORISTA');
  readonly mapaEdicao = signal<Record<TelaAcessoId, boolean>>({});

  readonly grupos = computed(() => {
    const set = new Set(TELAS_ACESSO.map((t) => t.grupo));
    return [...set];
  });

  readonly totalLiberadas = computed(() =>
    TELAS_ACESSO.filter((t) => this.mapaEdicao()[t.id]).length,
  );

  constructor() {
    this.carregarPerfil('MOTORISTA');
  }

  onPerfilChange(codigo: PerfilUsuarioCodigo): void {
    this.perfilSelecionado.set(codigo);
    this.carregarPerfil(codigo);
  }

  telasDoGrupo(grupo: string) {
    return TELAS_ACESSO.filter((t) => t.grupo === grupo);
  }

  permissaoAtiva(telaId: TelaAcessoId): boolean {
    return !!this.mapaEdicao()[telaId];
  }

  alternar(telaId: TelaAcessoId): void {
    const mapa = { ...this.mapaEdicao() };
    mapa[telaId] = !mapa[telaId];
    this.mapaEdicao.set(mapa);
  }

  marcarTodas(permitido: boolean): void {
    const mapa = Object.fromEntries(TELAS_ACESSO.map((t) => [t.id, permitido])) as Record<
      TelaAcessoId,
      boolean
    >;
    this.mapaEdicao.set(mapa);
  }

  restaurarPadrao(): void {
    this.acesso.restaurarPadrao(this.perfilSelecionado());
    this.carregarPerfil(this.perfilSelecionado());
    this.alertas.success('Controle de acesso', 'Permissões padrão restauradas para este perfil.');
  }

  salvar(): void {
    const perfil = this.perfilSelecionado();
    this.acesso.definirMapaPerfil(perfil, { ...this.mapaEdicao() });
    this.acesso.salvar();
    this.alertas.success('Controle de acesso', 'Permissões salvas com sucesso.');
  }

  labelPerfil(codigo: PerfilUsuarioCodigo): string {
    return this.perfis.find((p) => p.value === codigo)?.label ?? codigo;
  }

  private carregarPerfil(perfil: PerfilUsuarioCodigo): void {
    this.mapaEdicao.set({ ...this.acesso.obterMapaPerfil(perfil) });
  }
}
