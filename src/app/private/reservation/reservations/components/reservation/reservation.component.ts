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
import { ReservationPaymentTypesService } from '../../services/reservation-payment-types.service';
import { PaymentType } from '../../models/payment-type.model';

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
  paymentTypes: any[] = [];
  customer: any;
  totalProducts: number = 0;
  totalServices: number = 0;
  lockerPrice: number = 0;
  total: number = 0;
  reservationId: number = 0;
  payments: PaymentType[] = [
    { id: 1, description: 'Efectivo' },
    { id: 2, description: 'Tarjeta' },
    { id: 3, description: 'Mixto' },
  ];
  selectedPaymentType: any = this.payments[0];
  previousPaymentType: PaymentType = {
    id: 0,
    description: '',
  };

  paid: number = 0;
  cash: number = 0;
  card: number = 0;
  advance: number = 0;
  pending: number = 0;

  constructor(
    private readonly datePipe: DatePipe,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly facilitiesService: FacilitiesService,
    private readonly reservationLockersService: ReservationLockersService,
    private readonly reservationPaymentTypesService: ReservationPaymentTypesService,
    private readonly reservationProductsService: ReservationProductsService,
    private readonly reservationRoomsService: ReservationRoomsService,
    private readonly reservationServicesService: ReservationServicesService,
    private readonly reservationsService: ReservationsService,
  ) {}

  ngOnInit(): void {
    this.clearPayments();
    this.reservationId = this.dynamicDialogConfig.data.reservationId;
    this.facilities = this.dynamicDialogConfig.data.facilities;
    this.lockerPrice = this.facilities
      ?.filter(facility => facility.price)
      .reduce((sum, facility) => sum + facility.price, 0);

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
    this.paymentTypes = this.dynamicDialogConfig.data.paymentTypes;

    if (this.paymentTypes.length > 0) {
      this.paymentTypes.forEach((payment: any) => {
        this.selectedPaymentType = this.payments[payment.id - 1];
        this.paid += payment.paid;
        this.cash += payment.cash;
        this.card += payment.card;
        this.advance += payment.paid;
        this.pending = this.total - this.advance;
      });
    } else {
      this.paid = this.facilities
        ?.filter(facility => facility.isPaid)
        .reduce((sum, facility) => sum + facility.price, 0);

      this.paid += this.products
        ?.filter(product => product.isPaid)
        .reduce((sum, product) => sum + product.price, 0);

      this.paid += this.services
        ?.filter(service => service.isPaid)
        .reduce((sum, service) => sum + service.price, 0);
    }

    if (this.reservationId) {
      this.paid = this.pending;
    }
  }

  plusTotalPayment(event: any, price: number) {
    event.checked ? (this.paid += price) : (this.paid -= price);
  }

  calculateTotalCash(cash: any) {
    this.card = this.paid - cash;
  }

  calculateTotalCard(card: any) {
    this.cash = this.paid - card;
  }

  validatePaidButton() {
    if (this.selectedPaymentType.id == 3) {
      if (this.cash < 0) {
        return true;
      }
      if (this.card < 0) {
        return true;
      }
      if (this.cash + this.card != this.paid) {
        return true;
      }
    }

    if (this.selectedPaymentType.id == 1 || this.selectedPaymentType.id == 2) {
      if (this.paid < 0) {
        return true;
      }
    }

    return false;
  }

  payment(
    customer: Customer | null | undefined,
    reservationId: number | null | undefined,
    facilities: any,
    products: any,
    services: any,
    total: number,
  ) {
    const rooms: any[] = [];
    const lockers: any[] = [];
    facilities.forEach((facility: any) => {
      if (facility.type == FacilityType.ROOM) {
        rooms.push(facility);
      } else {
        lockers.push(facility);
      }
    });
    if (rooms.length > 0) {
      this.createRoomReservation(
        customer,
        reservationId,
        rooms,
        products,
        services,
        total,
      );
    }
    if (lockers.length > 0) {
      this.createLockerReservation(
        customer,
        reservationId,
        lockers,
        products,
        services,
        total,
      );
    }
  }

  createLockerReservation(
    customer: Customer | null | undefined,
    reservationId: number | null | undefined,
    facilities: any[],
    products: any[],
    services: any[],
    total: number,
  ) {
    if (reservationId) {
      const reservationData = {
        customerId: customer!.id,
        total: total,
        totalPaid: this.paid,
        reservationTypeId: 1,
        status: 'IN_USE',
      };

      if (this.paid == this.pending) {
        reservationData.status = 'COMPLETED';
        products.forEach(p => (p.isPaid = true));
        services.forEach(s => (s.isPaid = true));
        facilities.forEach(f => (f.isPaid = true));
      }

      const newProducts = products.filter(p => p.isAdd == true);
      products = products.filter(p => p.isAdd != true);
      const paidProducts = products.filter(p => p.isPaid == true);
      const newServices = services.filter(s => s.isAdd == true);
      services = services.filter(s => s.isAdd != true);
      const paidServices = services.filter(s => s.isPaid == true);
      const paidFacilities = facilities.filter(f => f.isPaid == true);

      const reservation = new LockerReservation(reservationData);
      this.reservationsService.update(reservationId, reservation).subscribe({
        next: () => {
          if (newProducts.length > 0) {
            newProducts.forEach((product: any) => {
              this.reservationProductsService
                .add(
                  reservationId,
                  product.id,
                  product.quantity,
                  product.isPaid,
                )
                .subscribe();
            });
          }
          if (paidProducts.length > 0) {
            paidProducts.forEach((product: any) => {
              this.reservationProductsService
                .modify(
                  reservationId,
                  product.id,
                  product.quantity,
                  product.isPaid,
                )
                .subscribe();
            });
          }
          if (newServices.length > 0) {
            newServices.forEach((service: any) => {
              this.reservationServicesService
                .add(
                  reservationId,
                  service.id,
                  service.quantity,
                  service.isPaid,
                )
                .subscribe();
            });
          }
          if (paidServices.length > 0) {
            paidServices.forEach((service: any) => {
              this.reservationServicesService
                .modify(
                  reservationId,
                  service.id,
                  service.quantity,
                  service.isPaid,
                )
                .subscribe();
            });
          }
          const paymentTypeBoy = {
            payment: this.paid,
            paymentTypeId: this.selectedPaymentType.id,
            cashPayment: this.cash,
            cardPayment: this.card,
          };
          this.reservationPaymentTypesService
            .add(
              reservationId,
              paymentTypeBoy.paymentTypeId,
              paymentTypeBoy.payment,
              paymentTypeBoy.cashPayment,
              paymentTypeBoy.cardPayment,
            )
            .subscribe();
          if (facilities.length > 0) {
            const reservationRequests = paidFacilities.map((facility: any) => {
              return this.reservationLockersService
                .modify(reservationId, facility.id, facility.isPaid)
                .pipe(
                  switchMap(() => {
                    const body: any = {
                      id: facility.id,
                      status: 'IN_USE',
                    };
                    if (reservationData.status == 'COMPLETED') {
                      body.status = 'AVAILABLE';
                    }
                    return this.facilitiesService.changeLockerStatus(
                      facility.id,
                      body,
                    );
                  }),
                );
            });
            if (reservationRequests.length > 0) {
              forkJoin(reservationRequests).subscribe({
                next: () => {
                  this.clearPayments();
                  this.dynamicDialogRef.close({ success: true });
                },
              });
            } else {
              this.clearPayments();
              this.dynamicDialogRef.close({ success: true });
            }
          }
        },
        error: () => {},
      });
    } else {
      const currentDate = new Date();
      const reservationDate = this.datePipe.transform(
        currentDate,
        'yyyy-MM-dd HH:mm:ss',
      );

      const reservationData = {
        reservationDate: reservationDate,
        customerId: customer!.id,
        total: total,
        totalPaid: this.paid,
        reservationTypeId: 1,
      };
      const reservation = new LockerReservation(reservationData);
      this.reservationsService.create(reservation).subscribe({
        next: (response: any) => {
          const paymentTypeBoy = {
            payment: this.paid,
            paymentTypeId: this.selectedPaymentType.id,
            cashPayment: this.cash,
            cardPayment: this.card,
          };
          this.reservationPaymentTypesService
            .add(
              response.reservationId,
              paymentTypeBoy.paymentTypeId,
              paymentTypeBoy.payment,
              paymentTypeBoy.cashPayment,
              paymentTypeBoy.cardPayment,
            )
            .subscribe();

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
              this.clearPayments();
              this.dynamicDialogRef.close({ success: true });
            },
          });
        },
      });
    }
  }

  createRoomReservation(
    customer: Customer | null | undefined,
    reservationId: number | null | undefined,
    facilities: any[],
    products: any[],
    services: any[],
    total: number,
  ) {
    if (reservationId) {
      const reservationData = {
        customerId: customer!.id,
        total: total,
        totalPaid: this.paid,
        reservationTypeId: 2,
        status: 'IN_USE',
      };

      if (this.paid == this.pending) {
        reservationData.status = 'COMPLETED';
        products.forEach(p => (p.isPaid = true));
        services.forEach(s => (s.isPaid = true));
        facilities.forEach(f => (f.isPaid = true));
      }

      const newProducts = products.filter(p => p.isAdd == true);
      products = products.filter(p => p.isAdd != true);
      const paidProducts = products.filter(p => p.isPaid == true);
      const newServices = services.filter(s => s.isAdd == true);
      services = services.filter(s => s.isAdd != true);
      const paidServices = services.filter(s => s.isPaid == true);
      const paidFacilities = facilities.filter(f => f.isPaid == true);

      const reservation = new RoomReservation(reservationData);
      this.reservationsService.update(reservationId, reservation).subscribe({
        next: () => {
          if (newProducts.length > 0) {
            newProducts.forEach((product: any) => {
              this.reservationProductsService
                .add(
                  reservationId,
                  product.id,
                  product.quantity,
                  product.isPaid,
                )
                .subscribe();
            });
          }
          if (paidProducts.length > 0) {
            paidProducts.forEach((product: any) => {
              this.reservationProductsService
                .modify(
                  reservationId,
                  product.id,
                  product.quantity,
                  product.isPaid,
                )
                .subscribe();
            });
          }
          if (newServices.length > 0) {
            newServices.forEach((service: any) => {
              this.reservationServicesService
                .add(
                  reservationId,
                  service.id,
                  service.quantity,
                  service.isPaid,
                )
                .subscribe();
            });
          }
          if (paidServices.length > 0) {
            paidServices.forEach((service: any) => {
              this.reservationServicesService
                .modify(
                  reservationId,
                  service.id,
                  service.quantity,
                  service.isPaid,
                )
                .subscribe();
            });
          }
          const paymentTypeBoy = {
            payment: this.paid,
            paymentTypeId: this.selectedPaymentType.id,
            cashPayment: this.cash,
            cardPayment: this.card,
          };
          this.reservationPaymentTypesService
            .add(
              reservationId,
              paymentTypeBoy.paymentTypeId,
              paymentTypeBoy.payment,
              paymentTypeBoy.cashPayment,
              paymentTypeBoy.cardPayment,
            )
            .subscribe();
          if (facilities.length > 0) {
            const reservationRequests = paidFacilities.map((facility: any) => {
              return this.reservationRoomsService
                .modify(reservationId, facility.id, facility.isPaid)
                .pipe(
                  switchMap(() => {
                    const body: any = {
                      id: facility.id,
                      status: 'IN_USE',
                    };
                    if (reservationData.status == 'COMPLETED') {
                      body.status = 'AVAILABLE';
                    }
                    return this.facilitiesService.changeRoomStatus(
                      facility.id,
                      body,
                    );
                  }),
                );
            });
            if (reservationRequests.length > 0) {
              forkJoin(reservationRequests).subscribe({
                next: () => {
                  this.clearPayments();
                  this.dynamicDialogRef.close({ success: true });
                },
              });
            } else {
              this.clearPayments();
              this.dynamicDialogRef.close({ success: true });
            }
          }
        },
        error: () => {},
      });
    } else {
      const currentDate = new Date();
      const reservationDate = this.datePipe.transform(
        currentDate,
        'yyyy-MM-dd HH:mm:ss',
      );

      const reservationData = {
        reservationDate: reservationDate,
        total: total,
        totalPaid: this.paid,
        customerId: customer!.id,
        reservationTypeId: 2,
      };
      const reservation = new RoomReservation(reservationData);
      this.reservationsService.create(reservation).subscribe({
        next: (response: any) => {
          const paymentTypeBoy = {
            payment: this.paid,
            paymentTypeId: this.selectedPaymentType.id,
            cashPayment: this.cash,
            cardPayment: this.card,
          };
          this.reservationPaymentTypesService
            .add(
              response.reservationId,
              paymentTypeBoy.paymentTypeId,
              paymentTypeBoy.payment,
              paymentTypeBoy.cashPayment,
              paymentTypeBoy.cardPayment,
            )
            .subscribe();
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
              this.clearPayments();
              this.dynamicDialogRef.close({ success: true });
            },
          });
        },
      });
    }
  }

  clearPayments() {
    this.paid = 0;
    this.cash = 0;
    this.card = 0;
    this.advance = 0;
    this.pending = 0;
  }
}
