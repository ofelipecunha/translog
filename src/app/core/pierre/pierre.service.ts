import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  PierreGetAccountsResponse,
  PierreGetBalanceResponse,
  PierreGetTransactionsResponse,
  PierreListPaymentRemindersResponse,
  PierrePaymentReminder,
  PierrePaymentReminderFilter,
  PierreTransacao,
} from './pierre.models';

/**
 * Integração com a API Pierre (mesmo contrato do `dashboardFront`):
 * - `GET {pierreApiUrl}/tools/api/get-balance` — header `Authorization: Bearer {pierreApiKey}`
 * - `GET {pierreApiUrl}/tools/api/get-transactions` — query `format=raw`, `startDate`, `endDate`
 */
@Injectable({ providedIn: 'root' })
export class PierreService {
  private readonly http = inject(HttpClient);
  /** Cache do extrato da última janela pedida (ex.: modal de histórico). */
  private extratoCache: PierreTransacao[] | null = null;
  private extratoCacheChave = '';

  private headers(): HttpHeaders | null {
    const key = environment.pierreApiKey?.trim();
    if (!key) {
      return null;
    }
    return new HttpHeaders({ Authorization: `Bearer ${key}` });
  }

  hasApiKey(): boolean {
    return !!environment.pierreApiKey?.trim();
  }

  getBalance(): Observable<PierreGetBalanceResponse> {
    const h = this.headers();
    if (!h) {
      throw new Error('pierreApiKey não configurada no environment.');
    }
    const url = `${environment.pierreApiUrl}/tools/api/get-balance`;
    return this.http.get<PierreGetBalanceResponse>(url, { headers: h });
  }

  /**
   * Transações entre as datas (inclusive), `format=raw`.
   * Usa cache quando a mesma janela é pedida de novo (ex.: reabrir modal).
   */
  getTransactionsRaw(inicio: Date, fim: Date): Observable<PierreTransacao[]> {
    const h = this.headers();
    if (!h) {
      throw new Error('pierreApiKey não configurada no environment.');
    }
    const start = this.formatarDataApi(inicio);
    const end = this.formatarDataApi(fim);
    const chave = `${start}|${end}`;
    if (this.extratoCache !== null && this.extratoCacheChave === chave) {
      return of([...this.extratoCache]);
    }
    const params = new HttpParams()
      .set('format', 'raw')
      .set('startDate', start)
      .set('endDate', end);
    const url = `${environment.pierreApiUrl}/tools/api/get-transactions`;
    return this.http.get<PierreGetTransactionsResponse>(url, { headers: h, params }).pipe(
      map((res) => res?.data ?? []),
      tap((lista) => {
        this.extratoCache = lista;
        this.extratoCacheChave = chave;
      }),
    );
  }

  /** Limpa cache de extrato (útil após logout ou para forçar refresh). */
  clearExtratoCache(): void {
    this.extratoCache = null;
    this.extratoCacheChave = '';
  }

  /**
   * `GET /tools/api/list-payment-reminders`
   * @param filter `upcoming` usa `days` (próximos X dias a partir de hoje).
   */
  listPaymentReminders(
    filter: PierrePaymentReminderFilter = 'upcoming',
    days = 30,
  ): Observable<PierrePaymentReminder[]> {
    const h = this.headers();
    if (!h) {
      throw new Error('pierreApiKey não configurada no environment.');
    }
    let params = new HttpParams().set('filter', filter);
    if (filter === 'upcoming') {
      params = params.set('days', String(days));
    }
    const url = `${environment.pierreApiUrl}/tools/api/list-payment-reminders`;
    return this.http
      .get<PierreListPaymentRemindersResponse>(url, { headers: h, params })
      .pipe(map((res) => res?.data ?? []));
  }

  /** `GET /tools/api/get-accounts` */
  getAccounts(): Observable<PierreGetAccountsResponse['data']> {
    const h = this.headers();
    if (!h) {
      throw new Error('pierreApiKey não configurada no environment.');
    }
    const url = `${environment.pierreApiUrl}/tools/api/get-accounts`;
    return this.http
      .get<PierreGetAccountsResponse>(url, { headers: h })
      .pipe(map((res) => res?.data ?? []));
  }

  /**
   * `GET /tools/api/get-transactions` com filtros opcionais (ex.: `accountType=LOAN`).
   */
  getTransactions(
    inicio: Date,
    fim: Date,
    opcoes?: { accountType?: string; includeStatus?: string },
  ): Observable<PierreTransacao[]> {
    const h = this.headers();
    if (!h) {
      throw new Error('pierreApiKey não configurada no environment.');
    }
    let params = new HttpParams()
      .set('format', 'raw')
      .set('startDate', this.formatarDataApi(inicio))
      .set('endDate', this.formatarDataApi(fim));
    if (opcoes?.accountType) {
      params = params.set('accountType', opcoes.accountType);
    }
    if (opcoes?.includeStatus) {
      params = params.set('includeStatus', opcoes.includeStatus);
    }
    const url = `${environment.pierreApiUrl}/tools/api/get-transactions`;
    return this.http
      .get<PierreGetTransactionsResponse>(url, { headers: h, params })
      .pipe(map((res) => res?.data ?? []));
  }

  /** Transações de contas `LOAN` no intervalo. */
  getLoanTransactions(inicio: Date, fim: Date): Observable<PierreTransacao[]> {
    return this.getTransactions(inicio, fim, {
      accountType: 'LOAN',
      includeStatus: 'PENDING,POSTED',
    });
  }

  private formatarDataApi(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
