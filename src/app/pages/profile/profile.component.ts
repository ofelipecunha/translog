
import { Component, inject, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { UserSessionProfileService } from '../../core/user/user-session-profile.service';

@Component({
  selector: 'app-profile',
  imports: [
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserInfoCardComponent,
    UserAddressCardComponent
],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly sessionProfile = inject(UserSessionProfileService);

  ngOnInit(): void {
    if (!this.tokenStorage.hasToken()) {
      return;
    }
    this.sessionProfile.load().subscribe({
      error: () => {
        /* cartões usam fallback da sessão */
      },
    });
  }

}
