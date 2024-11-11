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
import { showError } from '../../../../../../utils/notifications';
import { CreatedCustomer, Customer } from '../../../models/customer.model';
import { StatusLocker } from '../../../models/locker.model';
import {
  CreatedReservation,
  CustomerReservation,
} from '../../../models/reservation.model';
import { DniConsultation } from '../../../models/sunat.model';
import { CustomersService } from '../../../services/customers.service';
import { FemaleLockersService } from '../../../services/female-lockers.service';
import { MaleLockersService } from '../../../services/male-lockers.service';
import { ReservationsService } from '../../../services/reservations.service';
import { SunatService } from '../../../services/sunat.service';
import { ProductsAddComponent } from '../../products/products.component';
import { ServicesAddComponent } from '../../services/services.component';

@Component({
  selector: 'app-customer-reservation',
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
export class CustomerReservationComponent implements OnInit {
  reservationId: number = 0;
  isCreate: boolean = false;

  items: any[] = [
    { label: 'Cliente' },
    { label: 'Productos' },
    { label: 'Servicios' },
  ];

  currentIndex: number = 0;
  customerId: number = 0;
  userFounded: boolean = true;

  private dniSearchTermSubject = new Subject<string>();

  reservationForm: FormGroup = this.formBuilder.group({
    dni: [null, [Validators.required]],
    name: [{ value: null, disabled: true }, Validators.required],
    surname: [{ value: null, disabled: true }, Validators.required],
  });

  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly customersService: CustomersService,
    private readonly femaleLockersService: FemaleLockersService,
    private readonly maleLockersService: MaleLockersService,
    private readonly reservationsService: ReservationsService,
    private readonly sunatService: SunatService,
    private readonly datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    if (this.dynamicDialogConfig.data.locker) {
      this.updateStepStatus(true);
      const locker = this.dynamicDialogConfig.data.locker;
      this.isCreate = this.dynamicDialogConfig.data.create;

      if (!this.isCreate) {
        this.updateStepStatus(false);
        this.items = this.items.filter(item => item.label !== 'Cliente');
        if (this.currentIndex > 0) {
          this.currentIndex -= 1;
        }
      }

      if (locker.reservationId) {
        this.reservationId = locker.reservationId;
        this.reservationForm.get('dni')?.setValue(locker.customerDni);
        this.reservationForm.get('name')?.setValue(locker.customerName);
        this.reservationForm.get('surname')?.setValue(locker.customerSurname);
        this.updateStepStatus(false);
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
                    next: (customer: CreatedCustomer) => {
                      this.customerId = customer.customerId;
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

  buttonSaveReservation() {
    if (!this.userFounded) {
      const person: DniConsultation = this.reservationForm.value;
      this.customersService.create(person).subscribe({
        next: (customer: CreatedCustomer) => {
          this.customerId = customer.customerId;
          this.userFounded = true;
          this.disableFields(false);
          this.createReservation();
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
      this.createReservation();
    }
  }

  createReservation() {
    const currentDate = new Date();
    const reservationDate = this.datePipe.transform(
      currentDate,
      'yyyy-MM-dd HH:mm:ss',
    );
    const locker = this.dynamicDialogConfig.data.locker;
    const reservationData = {
      reservationDate: reservationDate,
      total: locker.price,
      customerId: this.customerId,
      lockerId: locker.id,
    };
    if (locker.reservationId == null) {
      const reservation = new CustomerReservation(reservationData);
      this.reservationsService.create(reservation).subscribe({
        next: (reservation: CreatedReservation) => {
          const body = {
            id: locker.id,
            status: 'IN_USE',
          };
          if (locker.genderId == 1) {
            const locker = new StatusLocker(body);
            const pagination = this.dynamicDialogConfig.data.pagination;
            this.maleLockersService
              .changeStatus(locker.id, body, pagination)
              .subscribe();
          } else {
            const locker = new StatusLocker(body);
            const pagination = this.dynamicDialogConfig.data.pagination;
            this.femaleLockersService
              .changeStatus(locker.id, body, pagination)
              .subscribe();
          }
          this.reservationId = reservation.reservationId;
          this.userFounded = false;
          this.updateStepStatus(false);
          this.currentIndex = 1;
        },
        error: () => {},
      });
    } else {
      this.updateStepStatus(false);
      this.currentIndex = 1;
    }
  }

  goToService(reservationId: number) {
    this.reservationId = reservationId;
    this.currentIndex = 2;
  }

  get isFormValid(): boolean {
    const dni = this.reservationForm.get('dni')?.value;
    if (dni && dni.length == 8) {
      return this.reservationForm.valid;
    } else {
      return false;
    }
  }
}
