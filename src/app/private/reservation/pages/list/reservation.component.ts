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
import { ReservationFormComponent } from '../form/reservation-form.component';
import { Customer } from '../../models/customer.model';
import { Facility } from '../../models/facility.model';
import { Product } from '../../models/product.model';
import { ButtonClassPipe } from '../../pipes/button-class.pipe';
import { FacilitiesService } from '../../services/facilities.service';
import { ReservationsService } from '../../services/reservations.service';
import { Service } from '../../models/service.model';

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
export class ReservationListComponent implements OnInit {
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
  constructor(
    private cdr: ChangeDetectorRef,
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
    this.selectedProducts = [];
    this.total = 0;
    this.customer = null;
    this.showProductsForm = false;
    this.reservationId = null;
    this.isPaid = false;
  }

  showFacility(facility: any) {
    this.reservationsService.getOne(facility.reservationId).subscribe({
      next: (reservation: any) => {
        this.selectedFacilities = reservation.facilities;
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
    } else {
      this.selectedFacilities.push(facility);
      this.total += facility.price;
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

  clearReservation() {
    this.getFacilities();
    this.clearSelections();
  }
}
