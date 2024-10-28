import { Component } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-reservation.layout',
  standalone: true,
  imports: [ConfirmDialogModule, TabMenuModule, ToastModule, TabViewModule],
  templateUrl: './reservation.layout.component.html',
  styleUrl: './reservation.layout.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ReservationLayoutComponent {
  tabs: MenuItem[] = [
    {
      id: '1',
      label: 'Listado',
      routerLink: ['./reservations'],
    },
    {
      id: '2',
      label: 'Reservas',
      routerLink: ['./books'],
    },
  ];
  activeItem: MenuItem = this.tabs[0];
}
