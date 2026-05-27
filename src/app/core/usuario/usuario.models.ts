import { HttpErrorResponse } from '@angular/common/http';
import { formatarTelefoneExibicao } from '../validators/br-format.util';

export type PerfilUsuarioCodigo =
  | 'ADMIN'
  | 'OPERADOR'
  | 'MOTORISTA'
  | 'CLIENTE'
  | 'USUARIO';

export const PERFIS_USUARIO: readonly { value: PerfilUsuarioCodigo; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'OPERADOR', label: 'Operador' },
  { value: 'MOTORISTA', label: 'Motorista' },
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'USUARIO', label: 'Usuário' },
] as const;

export interface UsuarioApiDto {
  idUsuario: number;
  nome: string;
  login: string;
  email: string;
  telefone?: string | null;
  perfil: string;
  ativo: string;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  dataCadastro?: string | null;
}

export interface UsuarioCreatePayload {
  nome: string;
  login: string;
  email: string;
  senha: string;
  telefone?: string;
  perfil: PerfilUsuarioCodigo;
  ativo?: 'S' | 'N';
}

export interface UsuarioUpdatePayload {
  nome: string;
  login: string;
  email: string;
  senha?: string;
  telefone?: string;
  perfil: PerfilUsuarioCodigo;
  ativo: 'S' | 'N';
}

export interface UsuarioLinha {
  id: number;
  nome: string;
  login: string;
  email: string;
  telefone: string;
  perfil: string;
  perfilLabel: string;
  ativo: boolean;
}

export function mapearLinhaUsuario(dto: UsuarioApiDto): UsuarioLinha {
  const perfil = (dto.perfil ?? 'USUARIO').toUpperCase();
  const perfilOpt = PERFIS_USUARIO.find((p) => p.value === perfil);
  return {
    id: dto.idUsuario,
    nome: dto.nome,
    login: dto.login,
    email: dto.email,
    telefone: formatarTelefoneExibicao(dto.telefone),
    perfil,
    perfilLabel: perfilOpt?.label ?? perfil,
    ativo: (dto.ativo ?? 'S').trim().toUpperCase() === 'S',
  };
}

export function mensagemErroUsuario(err: unknown, acao: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && 'message' in body) {
      return String((body as { message: string }).message);
    }
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }
  }
  return `Não foi possível ${acao} o usuário.`;
}
