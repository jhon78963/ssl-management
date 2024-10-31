import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { StepsModule } from 'primeng/steps';
import { SharedModule } from '../../../../../shared/shared.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { SunatService } from '../../services/sunat.service';
import { CustomersService } from '../../services/customers.service';
import { CreatedCustomer, Customer } from '../../models/customer.model';
import { DniConsultation } from '../../models/sunat.model';
import { showError, showSuccess } from '../../../../../utils/notifications';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ReservationsService } from '../../services/reservations.service';
import {
  CreatedReservation,
  CustomerReservation,
} from '../../models/reservation.model';
import { FemaleLockersService } from '../../services/female-lockers.service';
import { MaleLockersService } from '../../services/male-lockers.service';
import { StatusLocker } from '../../models/locker.model';
import { ServicesAddComponent } from '../services/services.component';
import { ProductsAddComponent } from '../products/products.component';

@Component({
  selector: 'app-reservation',
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
export class ReservationFormComponent implements OnInit {
  reservationId: number = 0;
  isCreate: boolean = false;

  items: any[] = [
    { label: 'Cliente' },
    { label: 'Productos' },
    { label: 'Servicios' },
  ];

  currentIndex: number = 0;
  customerId: number = 0;

  private dniSearchTermSubject = new Subject<string>();

  reservationForm: FormGroup = this.formBuilder.group({
    dni: [null, Validators.required],
    name: [null, Validators.required],
    surname: [null, Validators.required],
  });

  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly dynamicDialogRef: DynamicDialogRef,
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
          this.currentIndex -= 1; // Ajusta el índice si es necesario
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
              showSuccess(this.messageService, 'Se encontró el cliente.');
            },
            error: () => {
              this.sunatService.getPerson(dni).subscribe({
                next: (person: DniConsultation) => {
                  this.reservationForm.get('name')?.setValue(person.name);
                  this.reservationForm.get('surname')?.setValue(person.surname);
                  this.customersService.create(person).subscribe({
                    next: (customer: CreatedCustomer) => {
                      showSuccess(
                        this.messageService,
                        'Se registró el cliente.',
                      );
                      this.customerId = customer.customerId;
                    },
                    error: () =>
                      showError(
                        this.messageService,
                        'No se encontró el cliente. Ingreseló manualmente',
                      ),
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
            this.maleLockersService.changeStatus(locker.id, body).subscribe();
          } else {
            const locker = new StatusLocker(body);
            this.femaleLockersService.changeStatus(locker.id, body).subscribe();
          }
          showSuccess(
            this.messageService,
            'El locker ha sido registrado. Puedes agregar productos o servicios, o cerrar esta ventana.',
          );
          this.reservationId = reservation.reservationId;
          this.updateStepStatus(false);
          this.currentIndex = 1;
          // this.dynamicDialogRef.close();
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
    return this.reservationForm.valid;
  }
}
