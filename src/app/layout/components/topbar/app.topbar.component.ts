import { Component, ElementRef, ViewChild } from '@angular/core';
import { AppSidebarComponent } from '../sidebar/app.sidebar.component';
import { LayoutService } from '../../services/app.layout.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrl: './app.topbar.component.scss',
})
export class AppTopbarComponent {
  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
  activeItem!: number;
  fakeImage: boolean = false;
  imgProfile = '';

  constructor(
    public layoutService: LayoutService,
    public el: ElementRef,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onMenuButtonClick() {
    this.layoutService.onMenuToggle();
  }

  onSidebarButtonClick() {
    this.layoutService.showSidebar();
  }

  onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
  }

  onLogout() {
    const tokenData = JSON.parse(localStorage.getItem('tokenData') || '{}');
    this.authService.logout(tokenData.refreshToken, tokenData.token).subscribe({
      next: () => {
        localStorage.removeItem('tokenData');
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
      },
      error: () => {},
    });
  }
}
