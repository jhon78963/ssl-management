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
  selectedFacilities: any[] = [];
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

  isSelected(facility: any): boolean {
    return this.selectedFacilities.some(
      reservation => reservation.number === facility.number,
    );
  }

  clearSelections(): void {
    this.selectedFacilities = [];
  }

  getButtonClass(facility: any): string {
    if (facility.status === 'AVAILABLE') {
      return this.isSelected(facility)
        ? 'p-button-primary'
        : 'p-button-success';
    } else if (facility.status === 'IN_USE') {
      return 'p-button-danger';
    } else if (facility.status === 'IN_CLEANING') {
      return 'p-button-secondary';
    }
    return 'p-button-warning';
  }

  reservation(facility: any) {
    if (facility.status !== 'AVAILABLE') {
      return;
    }

    const index = this.selectedFacilities.findIndex(
      reservation => reservation.number === facility.number,
    );

    index === -1
      ? this.selectedFacilities.push(facility)
      : this.selectedFacilities.splice(index, 1);

    console.log('Reservas actuales:', this.selectedFacilities);
  }
}
