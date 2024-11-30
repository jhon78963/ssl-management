import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { forkJoin, switchMap } from 'rxjs';
import { Customer } from '../../models/customer.model';
import {
  LockerReservation,
  RoomReservation,
} from '../../models/reservation.model';
import { FacilitiesService } from '../../services/facilities.service';
import { ReservationLockersService } from '../../services/reservation-lockers.service';
import { ReservationProductsService } from '../../services/reservation-products.service';
import { ReservationServicesService } from '../../services/reservation-services.service';
import { ReservationsService } from '../../services/reservations.service';
import { ButtonModule } from 'primeng/button';
import { FacilityType } from '../../models/facility.model';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ReservationRoomsService } from '../../services/reservation-rooms.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    CheckboxModule,
    RadioButtonModule,
    InputNumberModule,
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
  providers: [DatePipe],
})
export class ReservationComponent implements OnInit {
  products: any[] = [];
  services: any[] = [];
  facilities: any[] = [];
  customer: any;
  totalProducts: number = 0;
  totalServices: number = 0;
  lockerPrice: number = 0;
  total: number = 0;
  reservationId: number = 0;
  payments: any[] = [
    { id: 1, name: 'Efectivo' },
    { id: 2, name: 'Tarjeta' },
    { id: 3, name: 'Mixto' },
  ];
  selectedPaymentType: any = this.payments[0];
  cash: number = 0;
  card: number = 0;
  constructor(
    private readonly datePipe: DatePipe,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly facilitiesService: FacilitiesService,
    private readonly reservationLockersService: ReservationLockersService,
    private readonly reservationProductsService: ReservationProductsService,
    private readonly reservationRoomsService: ReservationRoomsService,
    private readonly reservationServicesService: ReservationServicesService,
    private readonly reservationsService: ReservationsService,
  ) {}

  ngOnInit(): void {
    this.reservationId = this.dynamicDialogConfig.data.reservationId;
    this.facilities = this.dynamicDialogConfig.data.facilities;
    this.lockerPrice = this.facilities
      ?.filter(facility => facility.price)
      .reduce((sum, facility) => sum + facility.price, 0);

    console.log(this.dynamicDialogConfig.data.facilities);
    this.products = this.dynamicDialogConfig.data.products.filter(
      (product: any) => product.type == 'product',
    );
    this.totalProducts = this.products
      ?.filter(product => product.price)
      .reduce((sum, product) => sum + product.price * product.quantity, 0);

    if (this.dynamicDialogConfig.data.services.lenght > 0) {
      this.services = this.dynamicDialogConfig.data.services;
    } else {
      this.services = this.dynamicDialogConfig.data.products.filter(
        (product: any) => product.type == 'service',
      );
    }
    this.totalServices = this.services
      ?.filter(product => product.price)
      .reduce((sum, product) => sum + product.price * product.quantity, 0);

    this.total = this.totalProducts + this.totalServices + this.lockerPrice;
    this.customer = this.dynamicDialogConfig.data.customer;
  }

  payment(
    customer: Customer | null | undefined,
    reservationId: number | null | undefined,
    facilities: any,
    products: any,
    services: any,
    total: number,
  ) {
    console.log(total);
    const rooms: any[] = [];
    const lockers: any[] = [];
    facilities.forEach((facility: any) => {
      if (facility.type == FacilityType.ROOM) {
        rooms.push(facility);
      } else {
        lockers.push(facility);
      }
    });
    // console.log(facilities);
    // console.log(rooms);
    // console.log(lockers);
    // console.log(products);
    // console.log(services);
    // console.log(this.selectedPaymentType);
    if (rooms.length > 0) {
      this.createRoomReservation(customer, rooms, products, services);
    }
    if (lockers.length > 0) {
      this.createLockerReservation(customer, lockers, products, services);
    }
  }

  createLockerReservation(
    customer: Customer | null | undefined,
    facilities: any[],
    products: any[],
    services: any[],
  ) {
    const currentDate = new Date();
    const reservationDate = this.datePipe.transform(
      currentDate,
      'yyyy-MM-dd HH:mm:ss',
    );

    let total = 0;
    facilities.map((facility: any) => {
      total += facility.price;
    });

    const reservationData = {
      reservationDate: reservationDate,
      customerId: customer!.id,
      total: total,
      totalPaid: this.cash + this.card,
      reservationTypeId: 1,
    };
    const reservation = new LockerReservation(reservationData);
    this.reservationsService.create(reservation).subscribe({
      next: (response: any) => {
        products.forEach((product: any) => {
          this.reservationProductsService
            .add(
              response.reservationId,
              product.id,
              product.quantity,
              product.isPaid,
            )
            .subscribe();
        });
        services.forEach((service: any) => {
          this.reservationServicesService
            .add(
              response.reservationId,
              service.id,
              service.quantity,
              service.isPaid,
            )
            .subscribe();
        });
        const reservationRequests = facilities.map((facility: any) => {
          return this.reservationLockersService
            .add(
              response.reservationId,
              facility.id,
              facility.price,
              facility.isPaid,
            )
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
            this.dynamicDialogRef.close({ success: true });
          },
        });
      },
    });
  }

  createRoomReservation(
    customer: Customer | null | undefined,
    facilities: any[],
    products: any[],
    services: any[],
  ) {
    const currentDate = new Date();
    const reservationDate = this.datePipe.transform(
      currentDate,
      'yyyy-MM-dd HH:mm:ss',
    );

    let total = 0;
    facilities.map((facility: any) => {
      total += facility.price;
    });
    const reservationData = {
      reservationDate: reservationDate,
      total: total,
      totalPaid: this.cash + this.card,
      customerId: customer!.id,
      reservationTypeId: 2,
    };
    const reservation = new RoomReservation(reservationData);
    this.reservationsService.create(reservation).subscribe({
      next: (response: any) => {
        products.forEach((product: any) => {
          this.reservationProductsService
            .add(
              response.reservationId,
              product.id,
              product.quantity,
              product.isPaid,
            )
            .subscribe();
        });
        services.forEach((service: any) => {
          this.reservationServicesService
            .add(
              response.reservationId,
              service.id,
              service.quantity,
              service.isPaid,
            )
            .subscribe();
        });
        const reservationRequests = facilities.map((facility: any) => {
          return this.reservationRoomsService
            .add(
              response.reservationId,
              facility.id,
              facility.price,
              facility.isPaid,
            )
            .pipe(
              switchMap(() => {
                const body = {
                  id: facility.id,
                  status: 'IN_USE',
                };
                return this.facilitiesService.changeRoomStatus(
                  facility.id,
                  body,
                );
              }),
            );
        });
        forkJoin(reservationRequests).subscribe({
          next: () => {
            this.dynamicDialogRef.close({ success: true });
          },
        });
      },
    });
  }
}
