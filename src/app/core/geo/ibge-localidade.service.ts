import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Option } from '../../shared/components/form/select/select.component';

const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades';

interface IbgeMunicipio {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class IbgeLocalidadeService {
  private readonly http = inject(HttpClient);

  municipiosComoOpcoes(uf: string): Observable<Option[]> {
    const sigla = uf?.trim().toUpperCase();
    if (!sigla || sigla.length !== 2) {
      return new Observable((sub) => {
        sub.next([]);
        sub.complete();
      });
    }
    return this.http
      .get<IbgeMunicipio[]>(`${IBGE_BASE}/estados/${sigla}/municipios`, {
        params: { orderBy: 'nome' },
      })
      .pipe(
        map((lista) =>
          lista.map((m) => ({
            value: m.nome,
            label: m.nome,
          })),
        ),
      );
  }
}
