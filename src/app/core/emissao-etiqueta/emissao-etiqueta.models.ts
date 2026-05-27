import { HttpErrorResponse } from '@angular/common/http';

export interface EmissaoEtiquetaVolumeApiDto {
  numeroVolume: number;
  codigoEtiqueta: string;
}

export interface EmissaoEtiquetaApiDto {
  idEmissao: number;
  codEmpresaOrigem: number;
  codEmpresaDestino: number;
  numeroPedido: string;
  dataPedido: string;
  quantidadeVolumes: number;
  status: string;
  dataEmissao: string;
  volumes?: EmissaoEtiquetaVolumeApiDto[];
}

export interface EmissaoEtiquetaCreatePayload {
  codEmpresaOrigem: number;
  codEmpresaDestino: number;
  numeroPedido: string;
  dataPedido: string;
  quantidadeVolumes: number;
}

export function mensagemErroEmissaoEtiqueta(err: unknown, acao: string): string {
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
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }
  }
  return `Erro ao ${acao} emissão de etiquetas.`;
}
