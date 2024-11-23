import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { showSuccess } from '../../../utils/notifications';
import { CustomerReservationComponent } from '../reservations/components/customers/reservation/reservation.component';
import { Customer } from '../reservations/models/customer.model';
import { Facility, FacilityType } from '../reservations/models/facility.model';
import { StatusLocker } from '../reservations/models/locker.model';
import {
  CustomerReservation,
  RoomReservation,
} from '../reservations/models/reservation.model';
import { FacilitiesService } from '../reservations/services/facilities.service';
import { ReservationsService } from '../reservations/services/reservations.service';
import { ButtonClassPipe } from '../reservations/pipes/button-class.pipe';

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
    private cdRef: ChangeDetectorRef,
    private readonly datePipe: DatePipe,
    private readonly dialogService: DialogService,
    private readonly facilitiesService: FacilitiesService,
    private readonly messageService: MessageService,
    private readonly reservationsService: ReservationsService,
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
    const reservationRequests = selectedFacilities.map((facility: any) =>
      this.createReservation(customer!.id, facility),
    );

    forkJoin(reservationRequests).subscribe({
      next: () => {
        this.clearReservation();
      },
    });
  }

  clearReservation() {
    this.getFacilities();
    this.selectedFacilities = [];
    this.total = 0;
    this.customer = null;
  }

  createReservation(customerId: number, facility: any): Observable<any> {
    if (!facility) {
      return of(null);
    }

    const currentDate = new Date();
    const reservationDate = this.datePipe.transform(
      currentDate,
      'yyyy-MM-dd HH:mm:ss',
    );

    const config = this.getFacilityConfig(facility);
    if (!config) {
      return of(null);
    }

    const reservationData = {
      reservationDate,
      total: facility.price,
      customerId,
      [config.idField]: facility.id,
    };

    return this.reservationsService
      .create(new config.reservationClass(reservationData))
      .pipe(
        switchMap(() => {
          const body: any = {
            id: facility.id,
            status: 'IN_USE',
          };
          const facilitClass = new StatusLocker(body);
          return config.changeStatusMethod(facilitClass.id, body);
        }),
      );
  }

  getFacilityConfig(facility: any): {
    idField: string;
    reservationClass: any;
    changeStatusMethod: (id: number, body: any) => Observable<any>;
  } | null {
    if (facility.type === FacilityType.LOCKER) {
      return {
        idField: 'lockerId',
        reservationClass: CustomerReservation,
        changeStatusMethod: (id, locker) =>
          this.facilitiesService.changeLockerStatus(id, locker),
      };
    } else if (facility.type === FacilityType.ROOM) {
      return {
        idField: 'roomId',
        reservationClass: RoomReservation,
        changeStatusMethod: (id, room) =>
          this.facilitiesService.changeRoomStatus(id, room),
      };
    } else {
      console.error(`Unknown facility type: ${facility.type}`);
      return null; // Devuelve null en lugar de undefined
    }
  }

  // createReservation(customerId: number, locker: any) {
  //   if (!locker) {
  //     return of(null);
  //   }
  //   const currentDate = new Date();
  //   const reservationDate = this.datePipe.transform(
  //     currentDate,
  //     'yyyy-MM-dd HH:mm:ss',
  //   );
  //   const reservationData = {
  //     reservationDate: reservationDate,
  //     total: locker.price,
  //     customerId: customerId,
  //     lockerId: locker.id,
  //   };
  //   const reservation = new CustomerReservation(reservationData);
  //   return this.reservationsService.create(reservation).pipe(
  //     switchMap(() => {
  //       const body: any = {
  //         id: reservationData.lockerId,
  //         status: 'IN_USE',
  //       };
  //       const locker = new StatusLocker(body);
  //       return this.facilitiesService.changeLockerStatus(locker.id, body);
  //     }),
  //   );
  // }

  // createLockerReservation(customerId: number, locker: any) {
  //   if (!locker) {
  //     return of(null);
  //   }
  //   const currentDate = new Date();
  //   const reservationDate = this.datePipe.transform(
  //     currentDate,
  //     'yyyy-MM-dd HH:mm:ss',
  //   );
  //   const reservationData = {
  //     reservationDate: reservationDate,
  //     total: locker.price,
  //     customerId: customerId,
  //     lockerId: locker.id,
  //   };
  //   const reservation = new CustomerReservation(reservationData);
  //   return this.reservationsService.create(reservation).pipe(
  //     switchMap(() => {
  //       const body: any = {
  //         id: reservationData.lockerId,
  //         status: 'IN_USE',
  //       };
  //       const locker = new StatusLocker(body);
  //       return this.facilitiesService.changeLockerStatus(locker.id, body);
  //     }),
  //   );
  // }

  // createRoomReservation(customerId: number, room: any) {
  //   if (!room) {
  //     return of(null);
  //   }
  //   const currentDate = new Date();
  //   const reservationDate = this.datePipe.transform(
  //     currentDate,
  //     'yyyy-MM-dd HH:mm:ss',
  //   );
  //   const reservationData = {
  //     reservationDate: reservationDate,
  //     total: room.price,
  //     customerId: customerId,
  //     roomId: room.id,
  //   };
  //   const reservation = new RoomReservation(reservationData);
  //   return this.reservationsService.create(reservation).pipe(
  //     switchMap(() => {
  //       const body: any = {
  //         id: reservationData.roomId,
  //         status: 'IN_USE',
  //       };
  //       const locker = new StatusLocker(body);
  //       return this.facilitiesService.changeLockerStatus(locker.id, body);
  //     }),
  //   );
  // }
}
