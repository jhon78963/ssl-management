import { Component } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-reservation-form.layout',
  standalone: true,
  imports: [ConfirmDialogModule, TabMenuModule, ToastModule, TabViewModule],
  templateUrl: './reservation-form.layout.component.html',
  styleUrl: './reservation-form.layout.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ReservationFormLayoutComponent {
  tabs: MenuItem[] = [
    {
      id: '1',
      label: 'General',
      routerLink: ['./general'],
    },
    {
      id: '2',
      label: 'Privado',
      routerLink: ['./private'],
    },
  ];
  activeItem: MenuItem = this.tabs[0];
}
