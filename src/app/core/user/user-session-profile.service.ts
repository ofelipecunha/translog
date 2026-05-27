import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../auth/token-storage.service';
import { DEFAULT_AVATAR_URL } from './default-avatar';
import { PerfilUsuario, PerfilUsuarioUpdate } from './perfil-usuario.model';

@Injectable({ providedIn: 'root' })
export class UserSessionProfileService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly _profile = signal<PerfilUsuario | null>(null);

  readonly profile = this._profile.asReadonly();

  readonly avatarUrl = computed(() => resolveAvatarUrl(this._profile()?.imagem));

  load(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(environment.authMeUrl).pipe(
      tap((p) => this.applyProfile(p)),
    );
  }

  updatePerfil(body: PerfilUsuarioUpdate): Observable<PerfilUsuario> {
    return this.http.put<PerfilUsuario>(environment.authPerfilUrl, body).pipe(
      tap((p) => this.applyProfile(p)),
    );
  }

  uploadAvatar(file: File): Observable<PerfilUsuario> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<PerfilUsuario>(environment.authImagemUrl, body).pipe(
      tap((p) => this.applyProfile(p)),
    );
  }

  private applyProfile(p: PerfilUsuario): void {
    this._profile.set(p);
    this.tokenStorage.patchUser({
      nome: p.nome,
      email: p.email,
      imagem: p.imagem ?? undefined,
    });
  }

  clear(): void {
    this._profile.set(null);
  }
}

export function resolveAvatarUrl(imagem: string | null | undefined): string {
  const v = imagem?.trim();
  if (!v) {
    return DEFAULT_AVATAR_URL;
  }
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:')) {
    return v;
  }
  if (v.startsWith('/')) {
    return `${environment.apiUrl}${v}`;
  }
  return `${environment.apiUrl}/${v}`;
}
