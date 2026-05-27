import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AlertNotificationContainerComponent } from '../../components/ui/alert/alert-notification-container.component';
import { IdleSessionModalComponent } from '../../components/auth/idle-session-modal/idle-session-modal.component';
import { IdleSessionService } from '../../../core/auth/idle-session.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ControleAcessoService } from '../../../core/acesso/controle-acesso.service';
import { UserSessionProfileService } from '../../../core/user/user-session-profile.service';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppSidebarComponent,
    BackdropComponent,
    AlertNotificationContainerComponent,
    IdleSessionModalComponent,
  ],
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  private readonly idleSession = inject(IdleSessionService);
  private readonly auth = inject(AuthService);
  private readonly sessionProfile = inject(UserSessionProfileService);
  private readonly acesso = inject(ControleAcessoService);
  private readonly router = inject(Router);

  readonly isExpanded$;
  readonly isMobileOpen$;

  constructor(public sidebarService: SidebarService) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.idleSession.startMonitoring();
    this.sessionProfile.load().subscribe((p) => {
      const url = this.router.url.split('?')[0].split('#')[0];
      if (!this.acesso.podeAcessarRota(p.perfil, url)) {
        void this.router.navigateByUrl(this.acesso.primeiraRotaPermitida(p.perfil));
      }
    });
  }

  ngOnDestroy(): void {
    this.idleSession.stopMonitoring();
  }

  get containerClasses() {
    return [
      'flex-1',
      'transition-all',
      'duration-300',
      'ease-in-out',
      this.isExpanded$ ? 'xl:ml-[248px]' : 'xl:ml-[76px]',
      this.isMobileOpen$ ? 'ml-0' : ''
    ];
  }

}
