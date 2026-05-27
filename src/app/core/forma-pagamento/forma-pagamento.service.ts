import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { FormaPagamentoApiDto, FormaPagamentoPayload } from './forma-pagamento.models';

@Injectable({ providedIn: 'root' })
export class FormaPagamentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.formasPagamentoApiUrl;

  listar(): Observable<FormaPagamentoApiDto[]> {
    return this.http.get<FormaPagamentoApiDto[]>(this.baseUrl);
  }

  porId(id: number): Observable<FormaPagamentoApiDto> {
    return this.http.get<FormaPagamentoApiDto>(`${this.baseUrl}/${id}`);
  }

  criar(body: FormaPagamentoPayload): Observable<FormaPagamentoApiDto> {
    return this.http.post<FormaPagamentoApiDto>(this.baseUrl, body);
  }

  atualizar(id: number, body: FormaPagamentoPayload): Observable<FormaPagamentoApiDto> {
    return this.http.put<FormaPagamentoApiDto>(`${this.baseUrl}/${id}`, body);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
