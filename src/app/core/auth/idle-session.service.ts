import { Injectable, NgZone, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'click', 'scroll', 'touchstart'] as const;
const MOUSEMOVE_EVENT = 'mousemove';
const ACTIVITY_DEBOUNCE_MS = 1000;

@Injectable({ providedIn: 'root' })
export class IdleSessionService {
  private readonly zone = inject(NgZone);
  private readonly auth = inject(AuthService);

  private timerId: ReturnType<typeof setTimeout> | null = null;
  private listenersAttached = false;
  private lastActivityAt = 0;

  private readonly onActivityBound = () => this.onUserActivity();
  private readonly onMouseMoveBound = () => this.onMouseMove();

  /** Sessão expirou por inatividade — exibir modal e exigir novo login. */
  readonly sessionExpired = signal(false);

  startMonitoring(): void {
    if (this.listenersAttached) {
      this.resetIdleTimer();
      return;
    }
    this.sessionExpired.set(false);
    this.listenersAttached = true;
    this.zone.runOutsideAngular(() => {
      for (const ev of ACTIVITY_EVENTS) {
        document.addEventListener(ev, this.onActivityBound, { passive: true });
      }
      document.addEventListener(MOUSEMOVE_EVENT, this.onMouseMoveBound, { passive: true });
    });
    this.resetIdleTimer();
  }

  stopMonitoring(): void {
    this.clearIdleTimer();
    if (!this.listenersAttached) {
      return;
    }
    this.listenersAttached = false;
    for (const ev of ACTIVITY_EVENTS) {
      document.removeEventListener(ev, this.onActivityBound);
    }
    document.removeEventListener(MOUSEMOVE_EVENT, this.onMouseMoveBound);
    this.sessionExpired.set(false);
  }

  /** Chamado após o usuário confirmar o modal (antes do logout). */
  clearExpiredState(): void {
    this.sessionExpired.set(false);
  }

  private onUserActivity(): void {
    if (this.sessionExpired()) {
      return;
    }
    const now = Date.now();
    if (now - this.lastActivityAt < ACTIVITY_DEBOUNCE_MS) {
      return;
    }
    this.lastActivityAt = now;
    this.resetIdleTimer();
  }

  private onMouseMove(): void {
    this.onUserActivity();
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.zone.runOutsideAngular(() => {
      this.timerId = setTimeout(() => {
        this.zone.run(() => this.onIdleTimeout());
      }, environment.idleTimeoutMs);
    });
  }

  private onIdleTimeout(): void {
    if (!this.listenersAttached || this.sessionExpired()) {
      return;
    }
    this.clearIdleTimer();
    this.auth.expireSession();
    this.sessionExpired.set(true);
  }

  private clearIdleTimer(): void {
    if (this.timerId != null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
