import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { Observable } from 'rxjs';
import { Facility } from '../reservations/models/facility.model';
import { FacilitiesService } from '../reservations/services/facilities.service';

@Component({
  selector: 'app-reservation.layout',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDialogModule,
    TabMenuModule,
    ToastModule,
    TabViewModule,
  ],
  templateUrl: './reservation.layout.component.html',
  styleUrl: './reservation.layout.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ReservationLayoutComponent implements OnInit {
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
  selectedReservations: any[] = [];
  constructor(private readonly facilitiesService: FacilitiesService) {}

  ngOnInit(): void {
    this.getFacilities();
  }

  async getFacilities(): Promise<void> {
    this.facilitiesService.callGetList().subscribe();
  }

  get facilities(): Observable<Facility[]> {
    return this.facilitiesService.getList();
  }

  reservation(facility: any) {
    this.selectedReservations.push(facility);
    console.log(this.selectedReservations);
  }
}
