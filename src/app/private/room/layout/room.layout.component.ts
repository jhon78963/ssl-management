import { Component } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-room.layout',
  standalone: true,
  imports: [ConfirmDialogModule, TabMenuModule, ToastModule, TabViewModule],
  templateUrl: './room.layout.component.html',
  styleUrl: './room.layout.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class RoomLayoutComponent {
  tabs: MenuItem[] = [
    {
      id: '1',
      label: 'Habitaciones',
      routerLink: ['./rooms'],
    },
    {
      id: '2',
      label: 'Comodidades',
      routerLink: ['./amenities'],
    },
    {
      id: '3',
      label: 'Tarifario',
      routerLink: ['./rates'],
    },
    {
      id: '4',
      label: 'Comentarios',
      routerLink: ['./reviews'],
    },
  ];
  activeItem: MenuItem = this.tabs[0];
}
