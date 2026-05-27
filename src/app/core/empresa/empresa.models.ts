import { HttpErrorResponse } from '@angular/common/http';
import {
  formatarCnpjExibicao,
  formatarTelefoneExibicao,
} from '../validators/br-format.util';

export interface EmpresaApiDto {
  codEmpresa: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  ativo: string;
  dataCadastro?: string | null;
}

export interface EmpresaPayloadBase {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo?: 'S' | 'N';
}

export type EmpresaCreatePayload = EmpresaPayloadBase;
export type EmpresaUpdatePayload = EmpresaPayloadBase & { ativo: 'S' | 'N' };

export interface EmpresaLinha {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  ativo: boolean;
}

export function mapearLinhaEmpresa(dto: EmpresaApiDto): EmpresaLinha {
  return {
    id: dto.codEmpresa,
    razaoSocial: dto.razaoSocial,
    nomeFantasia: dto.nomeFantasia?.trim() || '—',
    cnpj: formatarCnpjExibicao(dto.cnpj),
    email: dto.email?.trim() || '—',
    telefone: formatarTelefoneExibicao(dto.telefone),
    cidade: dto.cidade?.trim() || '—',
    estado: dto.estado?.trim().toUpperCase() || '—',
    ativo: (dto.ativo ?? 'S').trim().toUpperCase() === 'S',
  };
}

export function mensagemErroEmpresa(err: unknown, acao: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object' && 'message' in body) {
      const msg = (body as { message?: string }).message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
    }
    if (err.status === 409) {
      return 'CNPJ já cadastrado.';
    }
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }
  }
  return `Erro ao ${acao} empresa.`;
}
