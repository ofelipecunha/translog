import { Injectable, signal } from '@angular/core';
import {
  MatrizPermissoes,
  MapaPermissoesPerfil,
  TELAS_ACESSO,
  TelaAcessoId,
  permissoesPadrao,
  rotasPorPerfil,
} from './tela-acesso.model';
import { PerfilUsuarioCodigo } from '../usuario/usuario.models';

const STORAGE_KEY = 'translog_matriz_permissoes';

@Injectable({ providedIn: 'root' })
export class ControleAcessoService {
  private readonly _matriz = signal<MatrizPermissoes>(this.carregar());

  readonly matriz = this._matriz.asReadonly();

  constructor() {
    this.carregar();
  }

  obterMapaPerfil(perfil: PerfilUsuarioCodigo): MapaPermissoesPerfil {
    const m = this._matriz();
    return { ...(m[perfil] ?? permissoesPadrao()[perfil]) };
  }

  atualizarPermissao(perfil: PerfilUsuarioCodigo, telaId: TelaAcessoId, permitido: boolean): void {
    const atual = { ...this._matriz() };
    const mapa = { ...this.obterMapaPerfil(perfil), [telaId]: permitido };
    atual[perfil] = mapa;
    this._matriz.set(atual);
  }

  definirMapaPerfil(perfil: PerfilUsuarioCodigo, mapa: MapaPermissoesPerfil): void {
    const atual = { ...this._matriz() };
    atual[perfil] = { ...mapa };
    this._matriz.set(atual);
  }

  marcarTodas(perfil: PerfilUsuarioCodigo, permitido: boolean): void {
    const mapa = Object.fromEntries(TELAS_ACESSO.map((t) => [t.id, permitido])) as MapaPermissoesPerfil;
    this.definirMapaPerfil(perfil, mapa);
  }

  restaurarPadrao(perfil?: PerfilUsuarioCodigo): void {
    const padrao = permissoesPadrao();
    if (perfil) {
      this.definirMapaPerfil(perfil, { ...padrao[perfil] });
      this.persistir();
      return;
    }
    this._matriz.set(structuredClone(padrao));
    this.persistir();
  }

  primeiraRotaPermitida(perfil: string | null | undefined): string {
    const codigo = (perfil ?? 'USUARIO').trim().toUpperCase() as PerfilUsuarioCodigo;
    if (codigo === 'ADMIN') {
      return '/';
    }
    const rotas = new Set(rotasPorPerfil(this._matriz(), codigo));
    for (const tela of TELAS_ACESSO) {
      if (rotas.has(tela.rota)) {
        return tela.rota;
      }
    }
    return '/signin';
  }

  salvar(): void {
    this.persistir();
  }

  podeAcessarRota(perfil: string | null | undefined, url: string): boolean {
    const codigo = (perfil ?? 'USUARIO').trim().toUpperCase() as PerfilUsuarioCodigo;
    if (codigo === 'ADMIN') {
      return true;
    }

    const path = url.split('?')[0].split('#')[0] || '/';
    const rotas = rotasPorPerfil(this._matriz(), codigo);

    if (path === '/' || path === '') {
      return rotas.some((r) => r === '/' || r === '');
    }

    return rotas.some((r) => path === r || path.startsWith(r + '/'));
  }

  private carregar(): MatrizPermissoes {
    const padrao = permissoesPadrao();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return padrao;
      }
      const parsed = JSON.parse(raw) as Partial<MatrizPermissoes>;
      return this.mesclarComPadrao(parsed, padrao);
    } catch {
      return padrao;
    }
  }

  private mesclarComPadrao(salvo: Partial<MatrizPermissoes>, padrao: MatrizPermissoes): MatrizPermissoes {
    const result = structuredClone(padrao);
    for (const perfil of Object.keys(padrao) as PerfilUsuarioCodigo[]) {
      if (salvo[perfil]) {
        for (const tela of TELAS_ACESSO) {
          if (typeof salvo[perfil]![tela.id] === 'boolean') {
            result[perfil][tela.id] = salvo[perfil]![tela.id];
          }
        }
      }
    }
    return result;
  }

  private persistir(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._matriz()));
    } catch {
      // ignore quota errors
    }
  }
}
