import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  EmissaoEtiquetaApiDto,
  EmissaoEtiquetaCreatePayload,
} from './emissao-etiqueta.models';

@Injectable({ providedIn: 'root' })
export class EmissaoEtiquetaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.emissaoEtiquetasApiUrl;

  listarPorPedido(numeroPedido: string): Observable<EmissaoEtiquetaApiDto[]> {
    const params = new HttpParams().set('numeroPedido', numeroPedido.trim());
    return this.http.get<EmissaoEtiquetaApiDto[]>(this.baseUrl, { params });
  }

  criar(body: EmissaoEtiquetaCreatePayload): Observable<EmissaoEtiquetaApiDto> {
    return this.http.post<EmissaoEtiquetaApiDto>(this.baseUrl, body);
  }
}
