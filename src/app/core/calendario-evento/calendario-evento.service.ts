import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CalendarioEventoApiDto, CalendarioEventoPayload } from './calendario-evento.models';

export type CalendarioEventoListagemFiltro = {
  dataInicio?: string;
  dataFim?: string;
};

@Injectable({ providedIn: 'root' })
export class CalendarioEventoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.calendarioEventosApiUrl;

  listar(filtro?: CalendarioEventoListagemFiltro): Observable<CalendarioEventoApiDto[]> {
    let params = new HttpParams();
    if (filtro?.dataInicio) {
      params = params.set('dataInicio', filtro.dataInicio);
    }
    if (filtro?.dataFim) {
      params = params.set('dataFim', filtro.dataFim);
    }
    return this.http.get<CalendarioEventoApiDto[]>(this.baseUrl, { params });
  }

  porId(id: number): Observable<CalendarioEventoApiDto> {
    return this.http.get<CalendarioEventoApiDto>(`${this.baseUrl}/${id}`);
  }

  criar(body: CalendarioEventoPayload): Observable<CalendarioEventoApiDto> {
    return this.http.post<CalendarioEventoApiDto>(this.baseUrl, body);
  }

  atualizar(id: number, body: CalendarioEventoPayload): Observable<CalendarioEventoApiDto> {
    return this.http.put<CalendarioEventoApiDto>(`${this.baseUrl}/${id}`, body);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
