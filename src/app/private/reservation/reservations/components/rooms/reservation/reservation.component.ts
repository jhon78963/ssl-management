import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { debounceTime, Subject } from 'rxjs';
import { SharedModule } from '../../../../../../shared/shared.module';
import { showError, showSuccess } from '../../../../../../utils/notifications';
import { RoomsService } from '../../../../../room/rooms/services/rooms.service';
import { CreatedCustomer, Customer } from '../../../models/customer.model';
import {
  CreatedReservation,
  RoomReservation,
} from '../../../models/reservation.model';
import { DniConsultation } from '../../../models/sunat.model';
import { CustomersService } from '../../../services/customers.service';
import { ReservationCustomersService } from '../../../services/reservation-customers.service';
import { ReservationsService } from '../../../services/reservations.service';
import { SunatService } from '../../../services/sunat.service';
import { ProductsAddComponent } from '../../products_legacy/products.component';
import { ServicesAddComponent } from '../../services/services.component';

@Component({
  selector: 'app-room-reservation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    StepsModule,
    ToastModule,
    ServicesAddComponent,
    ProductsAddComponent,
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
  providers: [DatePipe, MessageService],
})
export class RoomReservationComponent implements OnInit {
  reservationId: number = 0;
  isCreate: boolean = false;

  items: any[] = [
    { label: 'Cliente' },
    { label: 'Productos' },
    { label: 'Servicios' },
  ];

  currentIndex: number = 0;
  customerId: number = 0;
  customers: any[] | undefined = [];
  userFounded: boolean = true;

  private dniSearchTermSubject = new Subject<string>();

  reservationForm: FormGroup = this.formBuilder.group({
    dni: [null, Validators.required],
    name: [{ value: null, disabled: true }, Validators.required],
    surname: [{ value: null, disabled: true }, Validators.required],
  });

  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly customersService: CustomersService,
    private readonly roomsService: RoomsService,
    private readonly reservationsService: ReservationsService,
    private readonly reservationCustomersService: ReservationCustomersService,
    private readonly sunatService: SunatService,
    private readonly datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    if (this.dynamicDialogConfig.data.room) {
      this.updateStepStatus(true);
      const room = this.dynamicDialogConfig.data.room;
      this.isCreate = this.dynamicDialogConfig.data.create;

      if (room.reservationId) {
        this.reservationId = room.reservationId;
        this.reservationForm.get('dni')?.setValue(room.customerDni);
        this.reservationForm.get('name')?.setValue(room.customerName);
        this.reservationForm.get('surname')?.setValue(room.customerSurname);
        this.updateStepStatus(false);

        this.getCustomers(room.reservationId);
      }

      this.dniSearchTermSubject.pipe(debounceTime(600)).subscribe(() => {
        const dni = this.reservationForm.get('dni')?.value;
        if (dni.length == 8) {
          this.customersService.getByDni(dni).subscribe({
            next: (customer: Customer) => {
              this.reservationForm.get('name')?.setValue(customer.name);
              this.reservationForm.get('surname')?.setValue(customer.surname);
              this.customerId = customer.id;
            },
            error: () => {
              this.sunatService.getPerson(dni).subscribe({
                next: (person: DniConsultation) => {
                  this.reservationForm.get('name')?.setValue(person.name);
                  this.reservationForm.get('surname')?.setValue(person.surname);
                  this.customersService.create(person).subscribe({
                    next: (response: CreatedCustomer) => {
                      this.customerId = response.customer.id;
                      this.userFounded = false;
                    },
                    error: () => {
                      showError(
                        this.messageService,
                        'No se encontró el cliente. Ingreseló manualmente',
                      );
                      this.userFounded = false;
                      this.customerId = 0;
                      this.enableFields();
                    },
                  });
                },
              });
            },
          });
        } else {
          this.reservationForm.get('name')?.setValue(null);
          this.reservationForm.get('surname')?.setValue(null);
        }
      });
    }
  }

  enableFields(allFields: boolean = true) {
    if (!allFields) {
      this.reservationForm.get('dni')?.enable();
    }
    this.reservationForm.get('name')?.enable();
    this.reservationForm.get('surname')?.enable();
  }

  disableFields(allFields: boolean = true) {
    if (!allFields) {
      this.reservationForm.get('dni')?.disable();
    }
    this.reservationForm.get('name')?.disable();
    this.reservationForm.get('surname')?.disable();
  }

  getCustomers(reservationId: number) {
    this.reservationsService.getOne(reservationId).subscribe({
      next: (reservation: any) => {
        this.customers = reservation.customers;
      },
    });
  }

  updateStepStatus(disable: boolean = false) {
    this.items[1].disabled = disable;
    this.items[2].disabled = disable;
  }

  searchDni(term: any) {
    const input = term.target.value;
    const sanitizedInput = input.replace(/\D/g, '');
    if (sanitizedInput) {
      this.dniSearchTermSubject.next(sanitizedInput);
    }
  }

  saveReservation(isCustomerAdd: boolean = false) {
    if (!this.userFounded) {
      const person: DniConsultation = this.reservationForm.value;
      this.customersService.create(person).subscribe({
        next: (response: CreatedCustomer) => {
          this.customerId = response.customer.id;
          this.userFounded = true;
          this.disableFields();
          this.createReservation(isCustomerAdd);
        },
        error: () => {
          showError(
            this.messageService,
            'No se encontró el cliente. Ingreseló manualmente',
          );
          this.userFounded = false;
          this.customerId = 0;
          this.enableFields();
        },
      });
    } else {
      this.createReservation(isCustomerAdd);
    }
  }

  createReservation(isCustomerAdd: boolean = false) {
    const currentDate = new Date();
    const reservationDate = this.datePipe.transform(
      currentDate,
      'yyyy-MM-dd HH:mm:ss',
    );
    const room = this.dynamicDialogConfig.data.room;
    const reservationData = {
      reservationDate: reservationDate,
      total: room.pricePerCapacity,
      roomId: room.id,
      totalPaid: 0,
    };
    if (room.reservationId == null) {
      const reservation = new RoomReservation(reservationData);
      this.reservationsService.create(reservation).subscribe({
        next: (reservation: CreatedReservation) => {
          const body = {
            id: room.id,
            status: 'IN_USE',
          };
          this.reservationCustomersService
            .add(
              reservation.reservationId,
              this.customerId,
              room.pricePerAdditionalPerson,
            )
            .subscribe({
              next: () => {
                this.reservationForm.get('dni')?.setValue(null);
                this.reservationForm.get('name')?.setValue(null);
                this.reservationForm.get('surname')?.setValue(null);
              },
              error: () => {},
            });
          this.roomsService.changeStatus(room.id, body).subscribe();
          // showSuccess(this.messageService, 'La habitación ha sido registrado.');
          this.userFounded = false;
          this.reservationId = reservation.reservationId;
          this.getCustomers(this.reservationId);
          if (isCustomerAdd) {
            this.reservationForm.get('dni')?.setValue(null);
            this.reservationForm.get('name')?.setValue(null);
            this.reservationForm.get('surname')?.setValue(null);
          }
        },
        error: () => {
          this.userFounded = false;
        },
      });
    }
  }

  customerAddButton(reservationId: number) {
    if (reservationId == 0) {
      this.saveReservation(true);
    } else {
      if (this.customerId == 0) {
        const person: DniConsultation = this.reservationForm.value;
        this.customersService.create(person).subscribe({
          next: (response: CreatedCustomer) => {
            this.customerId = response.customer.id;
            this.userFounded = true;
            this.customerAddCreate();
            this.disableFields();
          },
          error: () => {
            showError(
              this.messageService,
              'No se encontró el cliente. Ingreseló manualmente',
            );
            this.userFounded = false;
            this.customerId = 0;
            this.enableFields();
          },
        });
      } else {
        this.customerAddCreate();
      }
    }
  }

  customerAddCreate() {
    const room = this.dynamicDialogConfig.data.room;
    this.reservationCustomersService
      .add(this.reservationId, this.customerId, room.pricePerAdditionalPerson)
      .subscribe({
        next: () => {
          this.getCustomers(this.reservationId);
          showSuccess(this.messageService, 'Se agregó el cliente.');
          this.reservationForm.get('dni')?.setValue(null);
          this.reservationForm.get('name')?.setValue(null);
          this.reservationForm.get('surname')?.setValue(null);
        },
        error: () => {},
      });
  }

  customerRemoveButton(customerId: number) {
    const room = this.dynamicDialogConfig.data.room;
    this.reservationCustomersService
      .remove(this.reservationId, customerId, room.pricePerAdditionalPerson)
      .subscribe({
        next: () => {
          this.getCustomers(this.reservationId);
        },
        error: () => {
          this.getCustomers(this.reservationId);
        },
      });
  }

  goToProducts(reservationId: number) {
    this.reservationId = reservationId;
    this.updateStepStatus(false);
    this.currentIndex = 1;
  }

  goToService(reservationId: number) {
    this.reservationId = reservationId;
    this.updateStepStatus(false);
    this.currentIndex = 2;
  }

  get isFormValid(): boolean {
    return this.reservationForm.valid;
  }
}
