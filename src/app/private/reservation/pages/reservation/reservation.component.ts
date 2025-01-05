import { CommonModule } from '@angular/common';
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
import { KeyFilterModule } from 'primeng/keyfilter';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { Observable } from 'rxjs';
import { SharedModule } from '../../../../shared/shared.module';
import { showSuccess } from '../../../../utils/notifications';
import { CustomerComponent } from '../../components/customers/customer.component';
import { ProductsComponent } from '../../components/products/products.component';
import { CashType } from '../../models/cash.model';
import { Customer } from '../../models/customer.model';
import { Facility, FacilityType } from '../../models/facility.model';
import { Product } from '../../models/product.model';
import { Service } from '../../models/service.model';
import { ButtonClassPipe } from '../../pipes/button-class.pipe';
import { CashService } from '../../services/cash.service';
import { FacilitiesService } from '../../services/facilities.service';
import { ReservationProductsService } from '../../services/reservations/reservation-products.service';
import { ReservationServicesService } from '../../services/reservations/reservation-services.service';
import { ReservationsService } from '../../services/reservations/reservations.service';
import { ReservationFormComponent } from '../form/reservation-form.component';

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
    ProductsComponent,
    CustomerComponent,
    KeyFilterModule,
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
  providers: [ConfirmationService, DialogService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationComponent implements OnInit {
  modal: DynamicDialogRef | undefined;
  selectedPaymentTypes: any[] = [];
  selectedFacilities: any[] = [];
  selectedProducts: Product[] = [];
  selectedServices: Service[] = [];
  total: number = 0;
  customer: Customer | null | undefined;
  showProductsForm: boolean = false;
  showCustomerForm: boolean = false;
  reservationId: number | null | undefined = null;
  isPaid: boolean = false;
  additionalPeople: number = 0;
  pricePerAdditionalPerson: number = 0;
  extraHours: number = 0;
  pricePerExtraHour: number = 0;
  startDate: string | null | undefined;
  startDateParsed: string | null | undefined;
  endDate: string | null | undefined;
  rentedTime: string | null | undefined;
  brokenThings: number | null = null;
  previousBrokenThings: number = 0;
  notes: string | null = null;
  isBooking: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private readonly cashService: CashService,
    private readonly dialogService: DialogService,
    private readonly facilitiesService: FacilitiesService,
    private readonly messageService: MessageService,
    private readonly reservationProductsService: ReservationProductsService,
    private readonly reservationServicesService: ReservationServicesService,
    private readonly reservationsService: ReservationsService,
  ) {}

  ngOnInit(): void {
    this.getFacilities();
    this.cashService.getCashTotal().subscribe();
  }

  get cashType(): Observable<CashType> {
    return this.cashService.getCashType();
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
    this.selectedProducts = [];
    this.total = 0;
    this.customer = null;
    this.showProductsForm = false;
    this.showCustomerForm = false;
    this.reservationId = null;
    this.isPaid = false;
    this.additionalPeople = 0;
    this.pricePerAdditionalPerson = 0;
    this.extraHours = 0;
    this.pricePerExtraHour = 0;
    this.startDate = undefined;
    this.startDateParsed = undefined;
    this.endDate = undefined;
    this.rentedTime = undefined;
    this.brokenThings = null;
    this.previousBrokenThings = 0;
    this.notes = null;
  }

  getRentedTime(startDate: string | null | undefined) {
    if (startDate) {
      const startDateParsed = new Date(startDate);
      const currentDate = new Date();
      const diffInMs = currentDate.getTime() - startDateParsed.getTime();

      const hours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

      return {
        time: `${hours}h ${minutes}m ${seconds}s`,
        hours: hours,
      };
    } else {
      return {
        time: null,
        hours: 0,
      };
    }
  }

  showFacility(facility: any) {
    this.clearSelections();
    this.reservationsService.getOne(facility.reservationId).subscribe({
      next: (reservation: any) => {
        this.startDateParsed = reservation.startDate;
        this.startDate = reservation.startDate;
        const rented = this.getRentedTime(this.startDate);
        this.rentedTime = rented.time;
        this.endDate = reservation.endDate;
        this.selectedFacilities = reservation.facilities;
        this.additionalPeople = reservation.facilities[0].additionalPeople;
        this.pricePerAdditionalPerson =
          reservation.facilities[0].pricePerAdditionalPerson;
        this.extraHours = reservation.facilities[0].extraHours;
        this.pricePerExtraHour = reservation.facilities[0].pricePerExtraHour;

        this.total = reservation.total;
        if (rented.hours > 0) {
          this.extraHours = rented.hours;
          this.total +=
            (reservation.facilities[0].pricePerExtraHour ?? 0) *
            this.extraHours;
        }
        this.customer = reservation.customer;
        this.selectedProducts = reservation.products;
        this.selectedServices = reservation.services;
        this.selectedServices.forEach((service: any) => {
          this.selectedProducts.push(service);
        });
        this.reservationId = reservation.id;
        this.isPaid = true;
        this.selectedPaymentTypes = reservation.paymentTypes;
        this.isBooking = false;
        this.cdr.detectChanges();
      },
    });
  }

  addFacility(facility: any): void {
    this.selectedFacilities.some(facility => facility.status === 'IN_USE') &&
      this.clearSelections();

    const isSelected = this.isSelected(facility);
    const index = this.selectedFacilities.findIndex(
      reservation => reservation.number === facility.number,
    );

    if (isSelected) {
      this.selectedFacilities.splice(index, 1);
      this.total -= facility.price;
      this.pricePerAdditionalPerson = 0;
      this.pricePerExtraHour = 0;
    } else {
      this.selectedFacilities.push(facility);
      this.total += facility.price;
      this.pricePerAdditionalPerson = facility.pricePerAdditionalPerson;
      this.pricePerExtraHour = facility.pricePerExtraHour;
    }

    const rooms = this.selectedFacilities.filter(
      facility => facility.type == FacilityType.ROOM,
    );
    this.isBooking = rooms.length > 0;
  }

  message(product: any): string {
    return `Deseas eliminar este ${this.getTypeLabel(product.type)}?`;
  }

  header(product: any): string {
    return `Eliminar ${this.getTypeLabel(product.type)}`;
  }

  private getTypeLabel(type: FacilityType): string {
    return type === FacilityType.PRODUCT ? 'producto' : 'servicio';
  }

  removeFacility(
    product: any,
    reservationId: number | null | undefined,
    event: Event,
  ): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.message(product),
      header: this.header(product),
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        if (reservationId && product.type == FacilityType.PRODUCT) {
          this.reservationProductsService
            .remove(reservationId, product.id, product.quantity)
            .subscribe();
        }

        if (reservationId && product.type == FacilityType.SERVICE) {
          this.reservationServicesService
            .remove(reservationId, product.id, product.quantity)
            .subscribe();
        }

        this.removeItem(product);
      },
      reject: () => {},
    });
  }

  removeItem(product: any) {
    const index = this.selectedProducts.findIndex(
      productInList =>
        productInList.id === product.id &&
        productInList.type == product.type &&
        productInList.isPaid == product.isPaid,
    );

    if (index != -1) {
      this.selectedProducts.splice(index, 1);
      this.total -= product.price;
    }
  }

  changeFreeProduct(event: any, product: any) {
    const index = this.selectedProducts.findIndex(
      productInList =>
        productInList.id === product.id &&
        productInList.type == product.type &&
        productInList.isPaid == product.isPaid,
    );

    if (index != -1) {
      if (event) {
        this.selectedProducts[index].total = 0;
        this.total -=
          this.selectedProducts[index].price *
          this.selectedProducts[index].quantity;
      } else {
        this.selectedProducts[index].total =
          this.selectedProducts[index].price *
          this.selectedProducts[index].quantity;

        this.total += this.selectedProducts[index].total;
      }
    }
  }

  addCustomer() {
    this.modal = this.dialogService.open(CustomerComponent, {
      header: `Agregar cliente`,
    });

    this.modal.onClose.subscribe({
      next: value => {
        if (value && value?.success) {
          this.customer = value.customer;
          this.isPaid = true;
          this.cdr.detectChanges();
        } else {
          null;
        }
      },
    });
  }

  showProducts() {
    this.showProductsForm = !this.showProductsForm;
  }

  showCustomers() {
    this.showCustomerForm = !this.showCustomerForm;
  }

  isExists(product: Product): boolean {
    return this.selectedProducts.includes(product);
  }

  getProducts(product: any) {
    const index = this.selectedProducts.findIndex(
      productInList =>
        productInList.id === product.id &&
        productInList.type == product.type &&
        productInList.isPaid == product.isPaid,
    );

    if (index !== -1) {
      if (product.isAdd) {
        this.selectedProducts[index].quantity += 1;
        this.selectedProducts[index].total += product.price;
        this.total += product.price;
      } else {
        this.selectedProducts[index].quantity -= 1;
        this.selectedProducts[index].total -= product.price;
        this.total -= product.price;
        if (this.selectedProducts[index].quantity == 0) {
          this.selectedProducts.splice(index, 1);
        }
      }
    } else {
      ++product.quantity;
      product.total = product.quantity * product.price;
      this.selectedProducts.push(product);
      this.total += product.price;
    }
  }

  getCustomer(customer: Customer | null) {
    if (customer) {
      this.customer = customer;
      this.isPaid = true;
    } else {
      this.customer = null;
      this.isPaid = false;
    }
  }

  saveReservationButton(
    customer: Customer | null | undefined,
    reservationId: number | null | undefined,
    selectedPaymentTypes: any,
    selectedFacilities: any,
    selectedProducts: any,
    selectedServices: any,
    additionalPeople: number,
    pricePerAdditionalPerson: number,
    extraHours: number,
    pricePerExtraHour: number,
    brokenThings: number | null,
    notes: string | null,
  ) {
    this.modal = this.dialogService.open(ReservationFormComponent, {
      header: reservationId ? 'Pago total' : 'Pago',
      data: {
        customer,
        reservationId,
        notes,
        facilities: selectedFacilities,
        products: selectedProducts,
        services: selectedServices,
        paymentTypes: selectedPaymentTypes,
        additionalPeople: additionalPeople || 0,
        pricePerAdditionalPerson: pricePerAdditionalPerson || 0,
        pricePerExtraHour: pricePerExtraHour || 0,
        extraHours: extraHours || 0,
        brokenThings: brokenThings || 0,
        isBooking: false,
      },
    });

    this.modal.onClose.subscribe({
      next: value => {
        if (value && value?.success) {
          showSuccess(this.messageService, 'Reservación registrada.');
          this.clearReservation();
        } else {
          null;
        }
        this.cdr.detectChanges();
      },
    });
  }

  saveBookingButton(
    customer: Customer | null | undefined,
    selectedPaymentTypes: any,
    selectedFacilities: any,
    selectedProducts: any,
    selectedServices: any,
    additionalPeople: number,
    pricePerAdditionalPerson: number,
    notes: string | null,
  ) {
    const bookingModal = this.dialogService.open(ReservationFormComponent, {
      header: 'Reservar',
      data: {
        customer,
        notes,
        paymentTypes: selectedPaymentTypes,
        facilities: selectedFacilities,
        products: selectedProducts,
        services: selectedServices,
        additionalPeople: additionalPeople || 0,
        pricePerAdditionalPerson: pricePerAdditionalPerson || 0,
        isBooking: true,
      },
    });

    bookingModal.onClose.subscribe({
      next: value => {
        if (value && value?.success) {
          showSuccess(this.messageService, 'Reservación registrada.');
          this.clearReservation();
        } else {
          null;
        }
        this.cdr.detectChanges();
      },
    });
  }

  addAdditionalPerson() {
    this.additionalPeople += 1;
    this.total += this.pricePerAdditionalPerson;
  }

  subAdditionalPerson() {
    if (this.additionalPeople == 0) return;
    this.additionalPeople -= 1;
    this.total -= this.pricePerAdditionalPerson;
  }

  addAdditionalHour() {
    this.extraHours += 1;
    this.total += this.pricePerExtraHour;
  }

  subAdditionalHour() {
    if (this.extraHours == 0) return;
    this.extraHours -= 1;
    this.total -= this.pricePerExtraHour;
  }

  addBrokenThings() {
    if (this.previousBrokenThings) {
      this.total -= this.previousBrokenThings;
    }

    const currentBrokenThings = Number(this.brokenThings) || 0;
    this.total += currentBrokenThings;
    this.previousBrokenThings = currentBrokenThings;
  }

  clearReservation() {
    this.getFacilities();
    this.clearSelections();
  }
}
