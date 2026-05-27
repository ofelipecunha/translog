import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  UsuarioApiDto,
  UsuarioCreatePayload,
  UsuarioUpdatePayload,
} from './usuario.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.usuariosApiUrl;

  listar(nome?: string): Observable<UsuarioApiDto[]> {
    let params = new HttpParams();
    const n = nome?.trim();
    if (n) {
      params = params.set('nome', n);
    }
    return this.http.get<UsuarioApiDto[]>(this.baseUrl, { params });
  }

  porId(id: number): Observable<UsuarioApiDto> {
    return this.http.get<UsuarioApiDto>(`${this.baseUrl}/${id}`);
  }

  criar(body: UsuarioCreatePayload): Observable<UsuarioApiDto> {
    return this.http.post<UsuarioApiDto>(this.baseUrl, body);
  }

  atualizar(id: number, body: UsuarioUpdatePayload): Observable<UsuarioApiDto> {
    return this.http.put<UsuarioApiDto>(`${this.baseUrl}/${id}`, body);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
