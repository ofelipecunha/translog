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
  private readonly _avatarCacheBust = signal(0);

  readonly profile = this._profile.asReadonly();
  readonly avatarCacheBust = this._avatarCacheBust.asReadonly();

  readonly avatarUrl = computed(() =>
    resolveAvatarUrl(this._profile()?.imagem, this._avatarCacheBust()),
  );

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
    this._avatarCacheBust.update((n) => n + 1);
    this.tokenStorage.patchUser({
      nome: p.nome,
      email: p.email,
      imagem: p.imagem ?? undefined,
    });
  }

  /** Recarrega perfil e força atualização da foto na UI. */
  refreshProfile(): Observable<PerfilUsuario> {
    return this.load();
  }

  clear(): void {
    this._profile.set(null);
  }
}

export function resolveAvatarUrl(
  imagem: string | null | undefined,
  cacheBust = 0,
): string {
  const v = imagem?.trim();
  if (!v) {
    return DEFAULT_AVATAR_URL;
  }
  let url: string;
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:')) {
    url = v;
  } else if (v.startsWith('/')) {
    url = `${environment.apiUrl}${v}`;
  } else {
    url = `${environment.apiUrl}/${v}`;
  }
  if (cacheBust > 0 && !url.startsWith('data:')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${cacheBust}`;
  }
  return url;
}
