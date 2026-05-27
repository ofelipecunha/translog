import { PerfilUsuarioCodigo, PERFIS_USUARIO } from '../usuario/usuario.models';

export type TelaAcessoId = string;

export interface TelaAcessoDef {
  id: TelaAcessoId;
  label: string;
  grupo: string;
  rota: string;
  descricao?: string;
}

/** Telas cadastradas no sistema (alinhar com rotas do menu). */
export const TELAS_ACESSO: readonly TelaAcessoDef[] = [
  { id: 'dashboard', label: 'Dashboard', grupo: 'Geral', rota: '/', descricao: 'Painel operacional' },
  { id: 'empresas', label: 'Empresas', grupo: 'Cadastros', rota: '/empresas' },
  { id: 'emissao-etiquetas', label: 'Emissão de ET.', grupo: 'Operações', rota: '/operacoes/emissao-etiquetas' },
  { id: 'conferencia-volumes', label: 'Conferência de Vol.', grupo: 'Operações', rota: '/operacoes/conferencia-volumes' },
  { id: 'carga-descarga', label: 'Carga e Descarga', grupo: 'Operações', rota: '/operacoes/carga-descarga' },
  { id: 'rota', label: 'Rota', grupo: 'Operações', rota: '/operacoes/rota' },
  { id: 'painel-divergencia', label: 'Painel de Divergência', grupo: 'Operações', rota: '/operacoes/painel-divergencia' },
  { id: 'entregas', label: 'Entregas', grupo: 'Operações', rota: '/fretes', descricao: 'Gestão de entregas / fretes' },
  { id: 'usuarios', label: 'Usuários', grupo: 'Sistema', rota: '/usuarios' },
  { id: 'controle-acesso', label: 'Controle de Acesso', grupo: 'Sistema', rota: '/sistema/controle-acesso' },
  { id: 'perfil', label: 'Perfil', grupo: 'Sistema', rota: '/profile' },
] as const;

export type MapaPermissoesPerfil = Record<TelaAcessoId, boolean>;

export type MatrizPermissoes = Record<PerfilUsuarioCodigo, MapaPermissoesPerfil>;

function mapaTodas(permitido: boolean): MapaPermissoesPerfil {
  return Object.fromEntries(TELAS_ACESSO.map((t) => [t.id, permitido])) as MapaPermissoesPerfil;
}

function mapaParcial(entradas: Partial<Record<TelaAcessoId, boolean>>): MapaPermissoesPerfil {
  const base = mapaTodas(false);
  for (const [id, val] of Object.entries(entradas)) {
    if (id in base) {
      base[id as TelaAcessoId] = !!val;
    }
  }
  return base;
}

/** Permissões padrão sugeridas por perfil. */
export function permissoesPadrao(): MatrizPermissoes {
  return {
    ADMIN: mapaTodas(true),
    OPERADOR: mapaParcial({
      dashboard: true,
      empresas: true,
      'emissao-etiquetas': true,
      'conferencia-volumes': true,
      'carga-descarga': true,
      rota: true,
      'painel-divergencia': true,
      entregas: true,
      usuarios: false,
      'controle-acesso': false,
      perfil: true,
    }),
    MOTORISTA: mapaParcial({
      entregas: true,
      perfil: true,
    }),
    CLIENTE: mapaParcial({
      dashboard: true,
      rota: true,
      entregas: true,
      perfil: true,
    }),
    USUARIO: mapaParcial({
      dashboard: true,
      perfil: true,
    }),
  };
}

export function rotasPorPerfil(matriz: MatrizPermissoes, perfil: string): string[] {
  const codigo = (perfil ?? 'USUARIO').toUpperCase() as PerfilUsuarioCodigo;
  const mapa = matriz[codigo] ?? matriz.USUARIO;
  return TELAS_ACESSO.filter((t) => mapa[t.id]).map((t) => t.rota);
}

export { PERFIS_USUARIO };
