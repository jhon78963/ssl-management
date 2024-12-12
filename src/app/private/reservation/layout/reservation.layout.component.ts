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
import { SharedModule } from '../../../shared/shared.module';
import { showSuccess } from '../../../utils/notifications';
import { CustomerReservationComponent } from '../reservations/components/customers/reservation/reservation.component';
import { ProductsComponent } from '../reservations/components/products/products.component';
import { ReservationComponent } from '../reservations/components/reservation/reservation.component';
import { Customer } from '../reservations/models/customer.model';
import { Facility } from '../reservations/models/facility.model';
import { Product } from '../reservations/models/product.model';
import { ButtonClassPipe } from '../reservations/pipes/button-class.pipe';
import { FacilitiesService } from '../reservations/services/facilities.service';
import { ReservationsService } from '../reservations/services/reservations.service';
import { Service } from '../reservations/models/service.model';

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
  templateUrl: './reservation.layout.component.html',
  styleUrl: './reservation.layout.component.scss',
  providers: [ConfirmationService, DatePipe, DialogService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationLayoutComponent implements OnInit {
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
    this.modal = this.dialogService.open(CustomerReservationComponent, {
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
    this.modal = this.dialogService.open(ReservationComponent, {
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
    // const selectedRooms: any[] = [];
    // const selectedLockers: any[] = [];
    // selectedFacilities.forEach((facility: any) => {
    //   if (facility.type == FacilityType.ROOM) {
    //     selectedRooms.push(facility);
    //   } else {
    //     selectedLockers.push(facility);
    //   }
    // });
    // this.cdr.detectChanges();
    // if (selectedRooms.length > 0) {
    //   this.createRoomReservation(customer, selectedRooms, selectedProducts);
    // }
    // if (selectedLockers.length > 0) {
    //   this.createLockerReservation(customer, selectedLockers, selectedProducts);
    // }
  }

  clearReservation() {
    this.getFacilities();
    this.clearSelections();
  }

  // createLockerReservation(
  //   customer: Customer | null | undefined,
  //   selectedFacilities: any[],
  //   selectedProducts: any[],
  // ) {
  //   const currentDate = new Date();
  //   const reservationDate = this.datePipe.transform(
  //     currentDate,
  //     'yyyy-MM-dd HH:mm:ss',
  //   );

  //   let total = 0;
  //   selectedFacilities.map((facility: any) => {
  //     total += facility.price;
  //   });

  //   const reservationData = {
  //     reservationDate: reservationDate,
  //     total: total,
  //     customerId: customer!.id,
  //     reservationTypeId: 1,
  //   };
  //   const reservation = new LockerReservation(reservationData);
  //   this.reservationsService.create(reservation).subscribe({
  //     next: (response: any) => {
  //       const reservationRequests = selectedFacilities.map((facility: any) => {
  //         return this.reservationLockersService
  //           .add(response.reservationId, facility.id, facility.price)
  //           .pipe(
  //             switchMap(() => {
  //               selectedProducts.forEach((product: any) => {
  //                 if (product.type == 'product') {
  //                   this.reservationProductsService
  //                     .add(
  //                       response.reservationId,
  //                       product.id,
  //                       product.quantity,
  //                       product.isPaid,
  //                     )
  //                     .subscribe();
  //                 } else {
  //                   this.reservationServicesService
  //                     .add(
  //                       response.reservationId,
  //                       product.id,
  //                       product.quantity,
  //                       product.isPaid,
  //                     )
  //                     .subscribe();
  //                 }
  //               });
  //               const body: any = {
  //                 id: facility.id,
  //                 status: 'IN_USE',
  //               };
  //               return this.facilitiesService.changeLockerStatus(
  //                 facility.id,
  //                 body,
  //               );
  //             }),
  //           );
  //       });
  //       forkJoin(reservationRequests).subscribe({
  //         next: () => {
  //           this.clearReservation();
  //         },
  //       });
  //     },
  //   });
  // }

  // createRoomReservation(
  //   customer: Customer | null | undefined,
  //   selectedFacilities: any[],
  //   selectedProducts: any[],
  // ) {
  //   const reservationRequests = selectedFacilities.map((facility: any) => {
  //     const currentDate = new Date();
  //     const reservationDate = this.datePipe.transform(
  //       currentDate,
  //       'yyyy-MM-dd HH:mm:ss',
  //     );
  //     const reservationData = {
  //       reservationDate: reservationDate,
  //       total: facility.price,
  //       customerId: customer!.id,
  //       roomId: facility.id,
  //     };
  //     const reservation = new RoomReservation(reservationData);
  //     return this.reservationsService.create(reservation).pipe(
  //       switchMap((response: any) => {
  //         console.log(response);
  //         selectedProducts.forEach((product: any) => {
  //           if (product.type == 'product') {
  //             this.reservationProductsService
  //               .add(
  //                 response.reservationId,
  //                 product.id,
  //                 product.quantity,
  //                 product.isPaid,
  //               )
  //               .subscribe();
  //           } else {
  //             this.reservationServicesService
  //               .add(
  //                 response.reservationId,
  //                 product.id,
  //                 product.quantity,
  //                 product.isPaid,
  //               )
  //               .subscribe();
  //           }
  //         });

  //         const body = {
  //           id: reservationData.roomId,
  //           status: 'IN_USE',
  //         };
  //         return this.facilitiesService.changeRoomStatus(
  //           reservationData.roomId,
  //           body,
  //         );
  //       }),
  //     );
  //   });
  //   forkJoin(reservationRequests).subscribe({
  //     next: () => {
  //       this.clearReservation();
  //     },
  //   });
  // }
}
