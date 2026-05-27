import { Component } from '@angular/core';
import { ThemeToggleTwoComponent } from '../../components/common/theme-toggle-two/theme-toggle-two.component';

@Component({
  selector: 'app-auth-page-layout',
  imports: [ThemeToggleTwoComponent],
  templateUrl: './auth-page-layout.component.html',
  styleUrls: ['./auth-page-layout.component.css'],
})
export class AuthPageLayoutComponent {
  readonly currentYear = new Date().getFullYear();
}
