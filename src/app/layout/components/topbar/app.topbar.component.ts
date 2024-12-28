import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { CashComponent } from '../../../private/reservation/components/cash/cash.component';
import { CashService } from '../../../private/reservation/services/cash.service';
import { LayoutService } from '../../services/app.layout.service';
import { AppSidebarComponent } from '../sidebar/app.sidebar.component';
import { CashType } from '../../../private/reservation/models/cash.model';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrl: './app.topbar.component.scss',
  providers: [DialogService],
})
export class AppTopbarComponent implements OnInit {
  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
  activeItem!: number;
  fakeImage: boolean = false;
  imgProfile = '';

  constructor(
    private readonly authService: AuthService,
    private readonly cashService: CashService,
    private readonly dialogService: DialogService,
    private readonly router: Router,
    public el: ElementRef,
    public layoutService: LayoutService,
  ) {}

  ngOnInit(): void {
    this.cashService.getCashTotal().subscribe();
    this.cashService.getCashValidate().subscribe();
  }

  get total(): Observable<number> {
    return this.cashService.getTotal();
  }

  get cashType(): Observable<CashType> {
    return this.cashService.getCashType();
  }

  cash() {
    this.cashType.subscribe({
      next: (cashType: CashType) => {
        this.dialogService.open(CashComponent, {
          header: cashType.label,
          data: {
            cashType,
            total: this.total,
          },
        });
      },
    });
  }

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
