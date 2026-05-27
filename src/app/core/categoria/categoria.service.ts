import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CategoriaApiDto, CategoriaPayload } from './categoria.models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.categoriasApiUrl;

  listar(): Observable<CategoriaApiDto[]> {
    return this.http.get<CategoriaApiDto[]>(this.baseUrl);
  }

  porId(id: number): Observable<CategoriaApiDto> {
    return this.http.get<CategoriaApiDto>(`${this.baseUrl}/${id}`);
  }

  criar(body: CategoriaPayload): Observable<CategoriaApiDto> {
    return this.http.post<CategoriaApiDto>(this.baseUrl, body);
  }

  atualizar(id: number, body: CategoriaPayload): Observable<CategoriaApiDto> {
    return this.http.put<CategoriaApiDto>(`${this.baseUrl}/${id}`, body);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
