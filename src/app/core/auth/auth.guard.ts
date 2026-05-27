import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TokenStorageService } from './token-storage.service';

/** Área autenticada: exige token; caso contrário envia para o login. */
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);
  if (storage.hasToken()) {
    return true;
  }
  return router.createUrlTree(['/signin']);
};

/** Páginas de login/registo: com sessão válida, vai para a home. */
export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);
  if (storage.hasToken()) {
    return router.createUrlTree(['/']);
  }
  return true;
};
