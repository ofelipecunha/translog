import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  EmpresaApiDto,
  EmpresaCreatePayload,
  EmpresaUpdatePayload,
} from './empresa.models';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.empresasApiUrl;

  listar(nome?: string): Observable<EmpresaApiDto[]> {
    let params = new HttpParams();
    const n = nome?.trim();
    if (n) {
      params = params.set('nome', n);
    }
    return this.http.get<EmpresaApiDto[]>(this.baseUrl, { params });
  }

  porId(id: number): Observable<EmpresaApiDto> {
    return this.http.get<EmpresaApiDto>(`${this.baseUrl}/${id}`);
  }

  criar(body: EmpresaCreatePayload): Observable<EmpresaApiDto> {
    return this.http.post<EmpresaApiDto>(this.baseUrl, body);
  }

  atualizar(id: number, body: EmpresaUpdatePayload): Observable<EmpresaApiDto> {
    return this.http.put<EmpresaApiDto>(`${this.baseUrl}/${id}`, body);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
