import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { forkJoin, Observable, switchMap } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { showSuccess } from '../../../utils/notifications';
import { CustomerReservationComponent } from '../reservations/components/customers/reservation/reservation.component';
import { Customer } from '../reservations/models/customer.model';
import { Facility, FacilityType } from '../reservations/models/facility.model';
import {
  LockerReservation,
  RoomReservation,
} from '../reservations/models/reservation.model';
import { ButtonClassPipe } from '../reservations/pipes/button-class.pipe';
import { FacilitiesService } from '../reservations/services/facilities.service';
import { ReservationLockersService } from '../reservations/services/reservation-lockers.service';
import { ReservationsService } from '../reservations/services/reservations.service';

@Component({
  selector: 'app-reservation.layout',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDialogModule,
    TabMenuModule,
    ToastModule,
    TabViewModule,
    DividerModule,
    SharedModule,
    ReactiveFormsModule,
    ButtonClassPipe,
  ],
  templateUrl: './reservation.layout.component.html',
  styleUrl: './reservation.layout.component.scss',
  providers: [ConfirmationService, DatePipe, DialogService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationLayoutComponent implements OnInit {
  modal: DynamicDialogRef | undefined;
  selectedFacilities: any[] = [];
  total: number = 0;
  customer: Customer | null | undefined;
  constructor(
    private readonly datePipe: DatePipe,
    private readonly dialogService: DialogService,
    private readonly facilitiesService: FacilitiesService,
    private readonly messageService: MessageService,
    private readonly reservationsService: ReservationsService,
    private readonly reservationLockersService: ReservationLockersService,
  ) {}

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
    return this.selectedFacilities.includes(facility);
  }

  clearSelections(): void {
    this.selectedFacilities = [];
    this.total = 0;
  }

  showFacility(facility: any) {
    console.log(facility);
    // this.reservationsService.getOne(facility.reservationId).subscribe({
    //   next: reservation => {
    //     console.log(reservation);
    //   },
    // });
  }

  addFacility(facility: any): void {
    const isSelected = this.isSelected(facility);
    const index = this.selectedFacilities.findIndex(
      reservation => reservation.number === facility.number,
    );

    if (isSelected) {
      this.selectedFacilities.splice(index, 1);
      this.total -= facility.price;
    } else {
      this.selectedFacilities.push(facility);
      this.total += facility.price;
    }
  }

  addCustomer() {
    this.modal = this.dialogService.open(CustomerReservationComponent, {
      header: `Agregar cliente`,
    });

    this.modal.onClose.subscribe({
      next: value => {
        if (value && value?.success) {
          showSuccess(this.messageService, 'Cliente agregado.');
          this.customer = value.customer;
        } else {
          null;
        }
      },
    });
  }

  buttonSaveReservation(
    customer: Customer | null | undefined,
    selectedFacilities: any,
  ) {
    const selectedRooms: any[] = [];
    const selectedLockers: any[] = [];
    selectedFacilities.forEach((facility: any) => {
      if (facility.type == FacilityType.ROOM) {
        selectedRooms.push(facility);
      } else {
        selectedLockers.push(facility);
      }
    });
    if (selectedRooms.length > 0) {
      this.createRoomReservation(customer, selectedRooms);
    }
    if (selectedLockers.length > 0) {
      this.createLockerReservation(customer, selectedLockers);
    }
  }

  clearReservation() {
    this.getFacilities();
    this.selectedFacilities = [];
    this.total = 0;
    this.customer = null;
  }

  createLockerReservation(
    customer: Customer | null | undefined,
    selectedFacilities: any[],
  ) {
    const currentDate = new Date();
    const reservationDate = this.datePipe.transform(
      currentDate,
      'yyyy-MM-dd HH:mm:ss',
    );

    let total = 0;
    selectedFacilities.map((facility: any) => {
      total += facility.price;
    });

    const reservationData = {
      reservationDate: reservationDate,
      total: total,
      customerId: customer!.id,
      reservationTypeId: 1,
    };
    const reservation = new LockerReservation(reservationData);
    this.reservationsService.create(reservation).subscribe({
      next: (response: any) => {
        const reservationRequests = selectedFacilities.map((facility: any) => {
          return this.reservationLockersService
            .add(response.reservationId, facility.id, facility.price)
            .pipe(
              switchMap(() => {
                const body: any = {
                  id: facility.id,
                  status: 'IN_USE',
                };
                return this.facilitiesService.changeLockerStatus(
                  facility.id,
                  body,
                );
              }),
            );
        });
        forkJoin(reservationRequests).subscribe({
          next: () => {
            this.clearReservation();
          },
        });
      },
    });
  }

  createRoomReservation(
    customer: Customer | null | undefined,
    selectedFacilities: any[],
  ) {
    const reservationRequests = selectedFacilities.map((facility: any) => {
      const currentDate = new Date();
      const reservationDate = this.datePipe.transform(
        currentDate,
        'yyyy-MM-dd HH:mm:ss',
      );
      const reservationData = {
        reservationDate: reservationDate,
        total: facility.price,
        customerId: customer!.id,
        roomId: facility.id,
      };
      const reservation = new RoomReservation(reservationData);
      return this.reservationsService.create(reservation).pipe(
        switchMap(() => {
          const body = {
            id: reservationData.roomId,
            status: 'IN_USE',
          };
          return this.facilitiesService.changeRoomStatus(
            reservationData.roomId,
            body,
          );
        }),
      );
    });
    forkJoin(reservationRequests).subscribe({
      next: () => {
        this.clearReservation();
      },
    });
  }
}
