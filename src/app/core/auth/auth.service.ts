import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from './login-response.model';
import { TokenStorageService } from './token-storage.service';
import { UserSessionProfileService } from '../user/user-session-profile.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly sessionProfile = inject(UserSessionProfileService);

  login(email: string, senha: string): Observable<LoginResponse> {
    const body = { email: email.trim(), senha: senha.trim() };
    return this.http.post<LoginResponse>(environment.authLoginUrl, body).pipe(
      map((res) => {
        if (!res?.token) {
          throw new HttpErrorResponse({
            status: 502,
            error: { message: 'Resposta sem token do servidor.' },
          });
        }
        return res;
      }),
      tap((res) => {
        this.tokenStorage.saveSession(res.token, {
          idLogin: res.idLogin,
          nome: res.nome,
          email: res.email,
          imagem: res.imagem ?? undefined,
        });
      }),
    );
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.hasToken();
  }

  /** Remove token e dados da sessão sem redirecionar (ex.: timeout por inatividade). */
  expireSession(): void {
    this.sessionProfile.clear();
    this.tokenStorage.clear();
  }

  logout(): void {
    this.expireSession();
    void this.router.navigateByUrl('/signin');
  }
}
