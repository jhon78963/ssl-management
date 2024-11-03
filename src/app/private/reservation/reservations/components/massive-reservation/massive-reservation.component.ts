import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SharedModule } from '../../../../../shared/shared.module';
import { debounceTime, Subject } from 'rxjs';
import { showError, showSuccess } from '../../../../../utils/notifications';
import { CreatedCustomer, Customer } from '../../models/customer.model';
import { MessageService } from 'primeng/api';
import { CustomersService } from '../../services/customers.service';
import { DniConsultation } from '../../models/sunat.model';
import { SunatService } from '../../services/sunat.service';
import {
  CreatedReservation,
  CustomerReservation,
} from '../../models/reservation.model';
import { StatusLocker } from '../../models/locker.model';
import { ReservationsService } from '../../services/reservations.service';
import { FemaleLockersService } from '../../services/female-lockers.service';
import { MaleLockersService } from '../../services/male-lockers.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-massive-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule],
  templateUrl: './massive-reservation.component.html',
  styleUrl: './massive-reservation.component.scss',
  providers: [MessageService, DatePipe],
})
export class MassiveReservationComponent implements OnInit {
  lockers: any[] = [];
  customerId: number = 0;
  reservationId: number = 0;
  isRegistered: boolean[] = [];

  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly customersService: CustomersService,
    private readonly sunatService: SunatService,
    private readonly reservationsService: ReservationsService,
    private readonly femaleLockersService: FemaleLockersService,
    private readonly maleLockersService: MaleLockersService,
    private readonly datePipe: DatePipe,
  ) {}

  reservationForms: FormGroup<any>[] = [];

  private dniSearchTermSubject = new Subject<any>();

  ngOnInit(): void {
    this.lockers = this.dynamicDialogConfig.data.selectedReservation;

    this.lockers.forEach(() => {
      const form = this.formBuilder.group({
        dni: [''],
        name: [''],
        surname: [''],
      });
      this.reservationForms.push(form);
      this.isRegistered.push(false);
    });
    this.dniSearchTermSubject
      .pipe(debounceTime(600))
      .subscribe(({ dni, index }) => {
        const form = this.reservationForms[index];
        if (dni.length === 8) {
          this.customersService.getByDni(dni).subscribe({
            next: (customer: Customer) => {
              form.get('name')?.setValue(customer.name);
              form.get('surname')?.setValue(customer.surname);
              this.customerId = customer.id;
              showSuccess(this.messageService, 'Se encontró el cliente.');
            },
            error: () => {
              this.sunatService.getPerson(dni).subscribe({
                next: (person: DniConsultation) => {
                  form.get('name')?.setValue(person.name);
                  form.get('surname')?.setValue(person.surname);
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
                        'No se encontró el cliente. Ingréselo manualmente.',
                      ),
                  });
                },
              });
            },
          });
        } else {
          form.get('name')?.setValue(null);
          form.get('surname')?.setValue(null);
        }
      });
  }

  searchDni(term: any, index: number) {
    const input = term.target.value;
    const sanitizedInput = input.replace(/\D/g, '');
    if (sanitizedInput) {
      this.dniSearchTermSubject.next({ dni: sanitizedInput, index });
    }
  }

  // En tu componente Angular
  getColumnClass(): string {
    const count = this.lockers.length;
    if (count === 1) return 'col-12';
    if (count === 2) return 'cold-12 md:col-6';
    return 'col-12 md:col-4'; // Para 3 o más elementos
  }

  buttonSaveReservation(locker: any, index: number) {
    const currentDate = new Date();
    const reservationDate = this.datePipe.transform(
      currentDate,
      'yyyy-MM-dd HH:mm:ss',
    );
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
          this.isRegistered[index] = true;
          // this.dynamicDialogRef.close();
        },
        error: () => {},
      });
    }
  }

  // get isFormValid(): boolean {
  //   return this.reservationForm.valid;
  // }
}
