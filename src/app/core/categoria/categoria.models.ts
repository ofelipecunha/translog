import { HttpErrorResponse } from '@angular/common/http';

export interface CategoriaApiDto {
  id: number;
  nome: string;
  tipo: string;
  ativo: boolean;
}

export interface CategoriaPayload {
  nome: string;
  tipo: string;
  ativo: boolean;
}

export type CategoriaLinha = {
  id: number;
  nome: string;
  tipoRaw: string;
  tipoLabel: string;
  ativo: boolean;
};

export const CATEGORIA_TIPO_OPCOES = [
  { valor: 'RECEITA', rotulo: 'Receita' },
  { valor: 'DESPESA', rotulo: 'Despesa' },
] as const;

export function etiquetaTipoCategoria(tipo: string | null | undefined): string {
  return (tipo ?? '').toUpperCase() === 'RECEITA' ? 'Receita' : 'Despesa';
}

export function normalizarTipoCategoria(tipo: string | null | undefined): string {
  return (tipo ?? '').toUpperCase() === 'RECEITA' ? 'RECEITA' : 'DESPESA';
}

export function mapearLinhaCategoria(dto: CategoriaApiDto): CategoriaLinha {
  const tipoRaw = normalizarTipoCategoria(dto.tipo);
  return {
    id: dto.id,
    nome: dto.nome,
    tipoRaw,
    tipoLabel: etiquetaTipoCategoria(tipoRaw),
    ativo: dto.ativo,
  };
}

export function mensagemErroCategoria(
  err: unknown,
  contexto: 'listar' | 'salvar' | 'excluir',
): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string } | null;
    if (body?.message && typeof body.message === 'string') {
      return body.message;
    }
    if (err.status === 0) {
      return 'Sem conexão com a API. Verifique se o servidor está no ar.';
    }
    return `Erro ao ${contexto} (HTTP ${err.status}).`;
  }
  return `Não foi possível ${contexto}.`;
}
