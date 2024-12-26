import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { forkJoin, switchMap } from 'rxjs';
import { Customer } from '../../models/customer.model';
import { FacilityType } from '../../models/facility.model';
import { PaymentType } from '../../models/payment-type.model';
import {
  LockerReservation,
  PersonalReservation,
  RoomReservation,
} from '../../models/reservation.model';
import { FacilitiesService } from '../../services/facilities.service';
import { ReservationLockersService } from '../../services/reservation-lockers.service';
import { ReservationPaymentTypesService } from '../../services/reservation-payment-types.service';
import { ReservationProductsService } from '../../services/reservation-products.service';
import { ReservationRoomsService } from '../../services/reservation-rooms.service';
import { ReservationServicesService } from '../../services/reservation-services.service';
import { ReservationsService } from '../../services/reservations.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    CheckboxModule,
    RadioButtonModule,
    InputNumberModule,
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss',
  providers: [DatePipe],
})
export class ReservationFormComponent implements OnInit {
  products: any[] = [];
  services: any[] = [];
  facilities: any[] = [];
  paymentTypes: any[] = [];
  customer: any;
  totalProducts: number = 0;
  totalServices: number = 0;
  lockerPrice: number = 0;
  total: number = 0;
  pricePerAdditionalPerson: number = 0;
  additionalPeople: number = 0;
  pricePerExtraHour: number = 0;
  extraHours: number = 0;
  brokenThings: number = 0;
  reservationId: number = 0;
  notes: string = '';
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

  getCustomer() {
    this.reservationId = this.dynamicDialogConfig.data.reservationId;
    this.customer = this.dynamicDialogConfig.data.customer;
  }

  getFacilities() {
    this.facilities = this.dynamicDialogConfig.data.facilities;
    this.lockerPrice = this.facilities
      ?.filter(facility => facility.price)
      .reduce((sum, facility) => sum + facility.price, 0);
  }

  getProducts() {
    this.products = this.dynamicDialogConfig.data.products
      .filter((product: any) => product.type == 'product')
      .map((product: any) => {
        if (product.isFree) {
          product.total = 0;
        } else {
          product.total = product.quantity * product.price;
        }
        return product;
      });

    this.totalProducts = this.products
      ?.filter(product => product.price)
      .reduce((sum, product) => sum + product.total, 0);
  }

  getServices() {
    if (this.dynamicDialogConfig.data.services.lenght > 0) {
      this.services = this.dynamicDialogConfig.data.services;
    } else {
      this.services = this.dynamicDialogConfig.data.products.filter(
        (product: any) => product.type == 'service',
      );
    }
    this.services = this.services.map((service: any) => {
      if (service.isFree) {
        service.total = 0;
      } else {
        service.total = service.quantity * service.price;
      }
      return service;
    });
    this.totalServices = this.services
      ?.filter(product => product.price)
      .reduce((sum, product) => sum + product.total, 0);
  }

  getNotes() {
    this.notes = this.dynamicDialogConfig.data.notes;
  }

  getPricePerAdditionalPerson() {
    this.additionalPeople = this.dynamicDialogConfig.data.additionalPeople;
    this.pricePerAdditionalPerson =
      this.additionalPeople == 0
        ? 0
        : this.dynamicDialogConfig.data.pricePerAdditionalPerson *
          this.additionalPeople;
  }

  getPriceExtraHours() {
    this.extraHours = this.dynamicDialogConfig.data.extraHours;
    this.pricePerExtraHour =
      this.extraHours == 0
        ? 0
        : this.dynamicDialogConfig.data.pricePerExtraHour * this.extraHours;
  }

  getBrokenThings() {
    this.brokenThings = this.dynamicDialogConfig.data.brokenThings;
  }

  getTotal() {
    this.total =
      this.totalProducts +
      this.totalServices +
      this.lockerPrice +
      (this.pricePerAdditionalPerson ?? 0) +
      (this.pricePerExtraHour ?? 0) +
      (Number(this.brokenThings) ?? 0);
  }

  getPaymentTypes() {
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
  }

  validatePaid() {
    if (this.reservationId) {
      this.paid = this.pending;
    }
  }

  ngOnInit(): void {
    this.clearPayments();
    this.getCustomer();
    this.getFacilities();
    this.getProducts();
    this.getServices();
    this.getNotes();
    this.getPricePerAdditionalPerson();
    this.getPriceExtraHours();
    this.getBrokenThings();
    this.getTotal();
    this.getPaymentTypes();
    this.validatePaid();
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

  validateFacilities(facilities: any[]) {
    return {
      rooms: facilities.filter(f => f.type == FacilityType.ROOM),
      lockers: facilities.filter(f => f.type == FacilityType.LOCKER),
    };
  }

  payment(
    customer: Customer | null | undefined,
    reservationId: number | null | undefined,
    facilities: any[],
    products: any[],
    services: any[],
    total: number,
  ) {
    const newFacilities = this.validateFacilities(facilities);
    if (newFacilities.rooms.length > 0) {
      this.createRoomReservation(
        customer,
        reservationId,
        newFacilities.rooms,
        products,
        services,
        total,
      );
    }
    if (newFacilities.lockers.length > 0) {
      this.createLockerReservation(
        customer,
        reservationId,
        newFacilities.lockers,
        products,
        services,
        total,
      );
    }
    if (newFacilities.rooms.length == 0 && newFacilities.lockers.length == 0) {
      this.createPersonalReservation(customer, products, services, total);
    }
  }

  validateReservationData(
    status: string,
    finalReservationDate: string | null | undefined,
    products: any[],
    services: any[],
    facilities: any[],
  ) {
    if (this.paid == this.pending) {
      status = 'COMPLETED';
      products.forEach(p => (p.isPaid = true));
      services.forEach(s => (s.isPaid = true));
      facilities.forEach(f => (f.isPaid = true));
      finalReservationDate = this.currentDate();
    }

    const newProducts = products.filter(p => p.isAdd == true);
    products = products.filter(p => p.isAdd != true);
    const paidProducts = products.filter(p => p.isPaid == true);
    const newServices = services.filter(s => s.isAdd == true);
    services = services.filter(s => s.isAdd != true);
    const paidServices = services.filter(s => s.isPaid == true);
    const paidFacilities = facilities.filter(f => f.isPaid == true);
    const brokenThingsImport = this.brokenThings ? this.brokenThings : 0;

    return {
      status,
      finalReservationDate,
      newProducts,
      paidProducts,
      newServices,
      paidServices,
      paidFacilities,
      brokenThingsImport,
    };
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
      const reservationData = this.reservationData(customer, total, 1);
      const reservationSummary = this.validateReservationData(
        reservationData.status,
        reservationData.finalReservationDate,
        products,
        services,
        facilities,
      );
      reservationData.status = reservationSummary.status;
      reservationData.brokenThingsImport =
        reservationSummary.brokenThingsImport;
      reservationData.finalReservationDate =
        reservationSummary.finalReservationDate;
      const reservation = new LockerReservation(reservationData);
      this.reservationsService.update(reservationId, reservation).subscribe({
        next: () => {
          this.updateReservation(
            reservationId,
            reservationSummary.newProducts,
            reservationSummary.paidProducts,
            reservationSummary.newServices,
            reservationSummary.paidServices,
          );
          this.addPaymentType(reservationId, reservationSummary.paidFacilities);
          this.lockerUpdateReservation(
            reservationId,
            reservationSummary.paidFacilities,
            reservationData.status,
          );
        },
        error: () => {},
      });
    } else {
      const initialReservationDate = this.currentDate();
      const reservationData = this.reservationData(
        customer,
        total,
        1,
        initialReservationDate || null,
        null,
      );
      const reservation = new LockerReservation(reservationData);
      this.reservationsService.create(reservation).subscribe({
        next: (response: any) => {
          this.createReservation(response.reservationId, products, services);
          this.lockerCreateReservation(response.reservationId, facilities);
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
      const reservationData = this.reservationData(customer, total, 2);
      const reservationSummary = this.validateReservationData(
        reservationData.status,
        reservationData.finalReservationDate,
        products,
        services,
        facilities,
      );
      reservationData.status = reservationSummary.status;
      reservationData.brokenThingsImport =
        reservationSummary.brokenThingsImport;
      reservationData.finalReservationDate =
        reservationSummary.finalReservationDate;

      const reservation = new RoomReservation(reservationData);
      this.reservationsService.update(reservationId, reservation).subscribe({
        next: () => {
          this.updateReservation(
            reservationId,
            reservationSummary.newProducts,
            reservationSummary.paidProducts,
            reservationSummary.newServices,
            reservationSummary.paidServices,
          );
          this.addPaymentType(reservationId, reservationSummary.paidFacilities);
          this.roomUpdateReservation(
            reservationId,
            reservationSummary.paidFacilities,
            reservationData.status,
          );
        },
        error: () => {},
      });
    } else {
      const initialReservationDate = this.currentDate();
      const reservationData = this.reservationData(
        customer,
        total,
        2,
        initialReservationDate || null,
        null,
      );
      const reservation = new RoomReservation(reservationData);
      this.reservationsService.create(reservation).subscribe({
        next: (response: any) => {
          this.createReservation(response.reservationId, products, services);
          this.roomCreateReservation(response.reservationId, facilities);
        },
      });
    }
  }

  createPersonalReservation(
    customer: Customer | null | undefined,
    products: any[],
    services: any[],
    total: number,
  ) {
    const initialReservationDate = this.currentDate();
    const reservationData = this.reservationData(
      customer,
      total,
      3,
      initialReservationDate || null,
      null,
    );
    reservationData.brokenThingsImport = this.brokenThings
      ? this.brokenThings
      : 0;
    const reservation = new PersonalReservation(reservationData);
    this.reservationsService.create(reservation).subscribe({
      next: (response: any) => {
        this.createReservation(response.reservationId, products, services);
        this.closeModal();
      },
    });
  }

  reservationData(
    customer: Customer | null | undefined,
    total: number,
    reservationTypeId: number,
    initialReservationDate?: string | null,
    finalReservationDate?: string | null,
    brokenThingsImport?: number,
  ) {
    return {
      initialReservationDate: initialReservationDate,
      finalReservationDate:
        reservationTypeId == 3 ? initialReservationDate : finalReservationDate,
      customerId: customer!.id,
      total: total,
      totalPaid: this.paid,
      peopleExtraImport: this.pricePerAdditionalPerson,
      hoursExtraImport: this.pricePerExtraHour,
      facilitiesImport: this.lockerPrice,
      consumptionsImport: this.totalProducts + this.totalServices,
      reservationTypeId: reservationTypeId,
      status: reservationTypeId == 3 ? 'COMPLETED' : 'IN_USE',
      brokenThingsImport: brokenThingsImport,
      notes: this.notes,
    };
  }

  addPaymentType(reservationId: number, paidFacilities?: any[]) {
    const paymentType = {
      payment: this.paid,
      paymentTypeId: this.selectedPaymentType.id,
      cashPayment: this.cash,
      cardPayment: this.card,
    };

    this.reservationPaymentTypesService
      .add(
        reservationId,
        paymentType.paymentTypeId,
        paymentType.payment,
        paymentType.cashPayment,
        paymentType.cardPayment,
      )
      .subscribe();

    if (paidFacilities && paidFacilities.length == 0) {
      this.closeModal();
    }
  }

  createReservation(reservationId: number, products: any[], services: any[]) {
    this.addPaymentType(reservationId);
    products.forEach((product: any) => {
      this.reservationProductsService
        .add(
          reservationId,
          product.id,
          product.quantity,
          product.isPaid,
          product.isFree,
        )
        .subscribe();
    });
    services.forEach((service: any) => {
      this.reservationServicesService
        .add(
          reservationId,
          service.id,
          service.quantity,
          service.isPaid,
          service.isFree,
        )
        .subscribe();
    });
  }

  lockerCreateReservation(reservationId: number, facilities: any[]) {
    const reservationRequests = facilities.map((facility: any) => {
      return this.reservationLockersService
        .add(reservationId, facility.id, facility.price, facility.isPaid)
        .pipe(
          switchMap(() => {
            const body: any = {
              id: facility.id,
              status: 'IN_USE',
            };
            return this.facilitiesService.changeLockerStatus(facility.id, body);
          }),
        );
    });
    forkJoin(reservationRequests).subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  roomCreateReservation(reservationId: number, facilities: any[]) {
    const reservationRequests = facilities.map((facility: any) => {
      return this.reservationRoomsService
        .add(
          reservationId,
          facility.id,
          facility.price,
          facility.isPaid,
          this.additionalPeople,
          this.extraHours,
        )
        .pipe(
          switchMap(() => {
            const body = {
              id: facility.id,
              status: 'IN_USE',
            };
            return this.facilitiesService.changeRoomStatus(facility.id, body);
          }),
        );
    });
    forkJoin(reservationRequests).subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  updateReservation(
    reservationId: number,
    newProducts: any[],
    paidProducts: any[],
    newServices: any[],
    paidServices: any[],
  ) {
    if (newProducts.length > 0) {
      newProducts.forEach((product: any) => {
        this.reservationProductsService
          .add(
            reservationId,
            product.id,
            product.quantity,
            product.isPaid,
            product.isFree,
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
            product.isFree,
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
            service.isFree,
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
            service.isFree,
          )
          .subscribe();
      });
    }
  }

  lockerUpdateReservation(
    reservationId: number,
    paidFacilities: any[],
    reservationStatus: string,
  ) {
    if (paidFacilities.length > 0) {
      const reservationRequests = paidFacilities.map((facility: any) => {
        return this.reservationLockersService
          .modify(reservationId, facility.id, facility.isPaid)
          .pipe(
            switchMap(() => {
              const body: any = {
                id: facility.id,
                status: 'IN_USE',
              };
              if (reservationStatus == 'COMPLETED') {
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
            this.closeModal();
          },
        });
      } else {
        this.closeModal();
      }
    }
  }

  roomUpdateReservation(
    reservationId: number,
    paidFacilities: any[],
    reservationStatus: string,
  ) {
    if (paidFacilities.length > 0) {
      const reservationRequests = paidFacilities.map((facility: any) => {
        return this.reservationRoomsService
          .modify(
            reservationId,
            facility.id,
            facility.isPaid,
            this.additionalPeople,
            this.extraHours,
          )
          .pipe(
            switchMap(() => {
              const body: any = {
                id: facility.id,
                status: 'IN_USE',
              };
              if (reservationStatus == 'COMPLETED') {
                body.status = 'AVAILABLE';
              }
              return this.facilitiesService.changeRoomStatus(facility.id, body);
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
  }

  currentDate() {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }

  closeModal() {
    this.clearPayments();
    this.dynamicDialogRef.close({ success: true });
  }

  clearPayments() {
    this.paid = 0;
    this.cash = 0;
    this.card = 0;
    this.advance = 0;
    this.pending = 0;
  }
}
