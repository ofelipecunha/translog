import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ControleAcessoService } from './controle-acesso.service';
import { UserSessionProfileService } from '../user/user-session-profile.service';
import { TokenStorageService } from '../auth/token-storage.service';

/** Bloqueia rota se o perfil do usuário não tiver permissão (matriz local / padrão). */
export const acessoGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const acesso = inject(ControleAcessoService);
  const perfilSvc = inject(UserSessionProfileService);
  const router = inject(Router);
  const storage = inject(TokenStorageService);

  if (!storage.hasToken()) {
    return router.createUrlTree(['/signin']);
  }

  const perfil = perfilSvc.profile()?.perfil;
  const url = state.url;

  if (!perfil) {
    return true;
  }

  if (acesso.podeAcessarRota(perfil, url)) {
    return true;
  }

  return router.createUrlTree([acesso.primeiraRotaPermitida(perfil)]);
};
