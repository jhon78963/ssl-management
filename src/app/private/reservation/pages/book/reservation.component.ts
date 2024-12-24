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
import { Observable } from 'rxjs';
import { SharedModule } from '../../../../shared/shared.module';
import { showSuccess } from '../../../../utils/notifications';
import { CustomerFormComponent } from '../../components/customers/customer-form.component';
import { ProductsComponent } from '../../components/products/products.component';
import { Customer } from '../../models/customer.model';
import { Facility, FacilityType } from '../../models/facility.model';
import { Product } from '../../models/product.model';
import { Service } from '../../models/service.model';
import { ButtonClassPipe } from '../../pipes/button-class.pipe';
import { FacilitiesService } from '../../services/facilities.service';
import { ReservationsService } from '../../services/reservations.service';
import { ReservationFormComponent } from '../form/reservation-form.component';
import { ReservationProductsService } from '../../services/reservation-products.service';
import { ReservationServicesService } from '../../services/reservation-services.service';

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
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
  providers: [ConfirmationService, DatePipe, DialogService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationBookComponent implements OnInit {
  modal: DynamicDialogRef | undefined;
  selectedPaymentTypes: any[] = [];
  selectedFacilities: any[] = [];
  selectedProducts: Product[] = [];
  selectedServices: Service[] = [];
  total: number = 0;
  customer: Customer | null | undefined;
  showProductsForm: boolean = false;
  reservationId: number | null | undefined = null;
  isPaid: boolean = false;
  additionalPeople: number = 0;
  pricePerAdditionalPerson: number = 0;
  extraHours: number = 0;
  pricePerExtraHour: number = 0;
  constructor(
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private readonly dialogService: DialogService,
    private readonly facilitiesService: FacilitiesService,
    private readonly messageService: MessageService,
    private readonly reservationsService: ReservationsService,
    private readonly reservationProductsService: ReservationProductsService,
    private readonly reservationServicesService: ReservationServicesService,
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
    this.selectedProducts = [];
    this.total = 0;
    this.customer = null;
    this.showProductsForm = false;
    this.reservationId = null;
    this.isPaid = false;
    this.additionalPeople = 0;
    this.pricePerAdditionalPerson = 0;
    this.extraHours = 0;
    this.pricePerExtraHour = 0;
  }

  showFacility(facility: any) {
    this.reservationsService.getOne(facility.reservationId).subscribe({
      next: (reservation: any) => {
        this.selectedFacilities = reservation.facilities;
        this.additionalPeople = reservation.facilities[0].additionalPeople;
        this.pricePerAdditionalPerson =
          reservation.facilities[0].pricePerAdditionalPerson;
        this.extraHours = reservation.facilities[0].extraHours;
        this.pricePerExtraHour = reservation.facilities[0].pricePerExtraHour;
        this.total = reservation.total;
        this.customer = reservation.customer;
        this.selectedProducts = reservation.products;
        this.selectedServices = reservation.services;
        this.selectedServices.forEach((service: any) => {
          this.selectedProducts.push(service);
        });
        this.reservationId = reservation.id;
        this.isPaid = true;
        this.selectedPaymentTypes = reservation.paymentTypes;
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
  }

  removeFacility(
    product: any,
    reservationId: number | null | undefined,
    event: Event,
  ): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseas eliminar este tipo de habitación?',
      header: 'Eliminar tipo de habitación',
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
    this.modal = this.dialogService.open(CustomerFormComponent, {
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

  buttonSaveReservation(
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
  ) {
    this.modal = this.dialogService.open(ReservationFormComponent, {
      header: reservationId ? 'Pago total' : 'Pago',
      data: {
        customer,
        reservationId,
        facilities: selectedFacilities,
        products: selectedProducts,
        services: selectedServices,
        paymentTypes: selectedPaymentTypes,
        additionalPeople: additionalPeople || 0,
        pricePerAdditionalPerson: pricePerAdditionalPerson || 0,
        pricePerExtraHour: pricePerExtraHour || 0,
        extraHours: extraHours || 0,
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

  clearReservation() {
    this.getFacilities();
    this.clearSelections();
  }
}
