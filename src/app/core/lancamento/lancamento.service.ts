import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { LancamentoApiDto, LancamentoPayload } from './lancamento.models';

export type LancamentoListagemFiltro = {
  dataInicio?: string;
  dataFim?: string;
};

@Injectable({ providedIn: 'root' })
export class LancamentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.lancamentosApiUrl;

  listar(filtro?: LancamentoListagemFiltro): Observable<LancamentoApiDto[]> {
    let params = new HttpParams();
    if (filtro?.dataInicio) {
      params = params.set('dataInicio', filtro.dataInicio);
    }
    if (filtro?.dataFim) {
      params = params.set('dataFim', filtro.dataFim);
    }
    return this.http.get<LancamentoApiDto[]>(this.baseUrl, { params });
  }

  porId(id: number): Observable<LancamentoApiDto> {
    return this.http.get<LancamentoApiDto>(`${this.baseUrl}/${id}`);
  }

  criar(body: LancamentoPayload): Observable<LancamentoApiDto> {
    return this.http.post<LancamentoApiDto>(this.baseUrl, body);
  }

  atualizar(id: number, body: LancamentoPayload): Observable<LancamentoApiDto> {
    return this.http.put<LancamentoApiDto>(`${this.baseUrl}/${id}`, body);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
