import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface StoredUser {
  idLogin: number;
  nome: string;
  email: string;
  imagem?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly keyToken = environment.sessionStorageKeys.token;
  private readonly keyUser = environment.sessionStorageKeys.user;

  saveSession(token: string, user: StoredUser): void {
    sessionStorage.setItem(this.keyToken, token);
    sessionStorage.setItem(this.keyUser, JSON.stringify(user));
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.keyToken);
  }

  getUser(): StoredUser | null {
    const raw = sessionStorage.getItem(this.keyUser);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }

  patchUser(partial: Partial<StoredUser>): void {
    const cur = this.getUser();
    if (!cur) {
      return;
    }
    sessionStorage.setItem(this.keyUser, JSON.stringify({ ...cur, ...partial }));
  }

  clear(): void {
    sessionStorage.removeItem(this.keyToken);
    sessionStorage.removeItem(this.keyUser);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
