import { Component, OnInit } from '@angular/core';
import { debounceTime, Observable, Subject } from 'rxjs';
import { Locker } from '../../../models/locker.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { InputNumberModule } from 'primeng/inputnumber';
import { MaleLockersService } from '../../../services/male-lockers.service';
import { FemaleLockersService } from '../../../services/female-lockers.service';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { CustomerReservationComponent } from '../../../components/customers/reservation/reservation.component';
import { CheckoutComponent } from '../../../components/customers/checkout/checkout.component';
import { LockersService } from '../../../services/lockers.service';
import { CheckboxModule } from 'primeng/checkbox';
import { MassiveReservationComponent } from '../../../components/massive-reservation/massive-reservation.component';
// import { showSuccess } from '../../../../../../utils/notifications';

@Component({
  selector: 'app-customer-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectButtonModule,
    PaginatorModule,
    InputNumberModule,
    TooltipModule,
    CheckboxModule,
  ],
  templateUrl: './customer-reservation-form.component.html',
  styleUrl: './customer-reservation-form.component.scss',
  providers: [MessageService],
})
export class CustomerReservationFormComponent implements OnInit {
  modal: DynamicDialogRef | undefined;
  genderOptions = [
    { name: 'Masculino', value: 1 },
    { name: 'Femenino', value: 2 },
  ];

  genderSelected: any = this.genderOptions[0];

  statusOptions = [
    { name: 'Disponible', value: 1 },
    { name: 'En uso', value: 2 },
  ];

  statusSelected: any = this.statusOptions[0];
  femaleStatusSelected: any = this.statusOptions[0];

  rowsPerPageOptions: number[] = [12, 24, 50];

  first: number = 0;
  limit: number = 12;
  page: number = 1;
  number: string = '';
  gender: number = 1;
  status: string = 'AVAILABLE';

  femaleLimit: number = 12;
  femalePage: number = 1;
  femaleNumber: string = '';
  firstFemale: number = 0;
  femaleGender: number = 2;
  femaleStatus: string = 'AVAILABLE';

  lockerLimit: number = 12;
  lockerPage: number = 1;
  lockerNumber: string = '';
  firstLocker: number = 0;
  lockerStatus: string = 'IN_USE';

  private searchTermSubject = new Subject<string>();
  private searchFemaleTermSubject = new Subject<string>();
  private searchLockerTermSubject = new Subject<string>();

  selectedReservations: any[] = [];

  constructor(
    private readonly dialogService: DialogService,
    public messageService: MessageService,
    private readonly femaleLockersService: FemaleLockersService,
    private readonly lockersService: LockersService,
    private readonly maleLockersService: MaleLockersService,
  ) {}

  ngOnInit(): void {
    if (this.gender == 1) {
      this.getMaleLockers(
        this.limit,
        this.page,
        this.number,
        this.gender,
        this.status,
      );
    } else {
      this.getFemaleLockers(
        this.femaleLimit,
        this.femalePage,
        this.femaleNumber,
        this.femaleGender,
        this.femaleStatus,
      );
    }
    this.searchTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getMaleLockers(
        this.limit,
        this.page,
        this.number,
        this.gender,
        this.status,
      );
    });
    this.searchFemaleTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getFemaleLockers(
        this.femaleLimit,
        this.femalePage,
        this.femaleNumber,
        this.femaleGender,
        this.femaleStatus,
      );
    });
    this.searchLockerTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getLockers(
        this.lockerLimit,
        this.lockerPage,
        this.lockerNumber,
        this.lockerStatus,
      );
    });
  }

  genderChange(event: any) {
    if (event.value?.value == 1) {
      this.first = (this.page - 1) * this.limit;
      this.getMaleLockers(
        this.limit,
        this.page,
        this.number,
        this.gender,
        this.status,
      );
    } else {
      this.firstFemale = (this.femalePage - 1) * this.femaleLimit;
      this.getFemaleLockers(
        this.femaleLimit,
        this.femalePage,
        this.femaleNumber,
        this.femaleGender,
        this.femaleStatus,
      );
    }
  }

  massiveReservation(selectedReservation: any[]) {
    this.modal = this.dialogService.open(MassiveReservationComponent, {
      data: { selectedReservation },
      header: 'Registrar',
    });
  }

  reservation(locker: Locker) {
    this.modal = this.dialogService.open(CustomerReservationComponent, {
      data: {
        locker,
        create: true,
      },
      header: `Registrar Locker N° ${locker.number}`,
    });
  }

  show(locker: Locker) {
    this.modal = this.dialogService.open(CustomerReservationComponent, {
      data: { locker },
      header: `Agregar servicios Locker N° ${locker.number}`,
    });
  }

  finish(locker: Locker) {
    this.modal = this.dialogService.open(CheckoutComponent, {
      data: { locker },
      header: `Checkout Locker N° ${locker.number}`,
    });

    this.modal.onClose.subscribe({
      next: () => {
        this.getLockers(
          this.lockerLimit,
          this.lockerPage,
          this.lockerNumber,
          this.lockerStatus,
        );
      },
      error: () => {
        this.getLockers(
          this.lockerLimit,
          this.lockerPage,
          this.lockerNumber,
          this.lockerStatus,
        );
      },
    });
  }

  statusChange(event: any) {
    if (event.value?.value == 1) {
      this.first = (this.page - 1) * this.limit;
      this.status = 'AVAILABLE';
      this.statusSelected = this.statusOptions[0];
      this.getMaleLockers(
        this.limit,
        this.page,
        this.number,
        this.gender,
        this.status,
      );
    } else {
      this.first = (this.page - 1) * this.limit;
      this.status = 'IN_USE';
      this.statusSelected = this.statusOptions[1];
      this.getLockers(
        this.lockerLimit,
        this.lockerPage,
        this.lockerNumber,
        this.lockerStatus,
      );
    }
  }

  onMaleLockerPageChange(event: any) {
    this.page = event.page + 1;
    this.first = event.first;
    this.getMaleLockers(
      this.limit,
      this.page,
      this.number,
      this.gender,
      this.status,
    );
  }

  onFilter(term: any) {
    const input = term.target.value;
    if (input == '') {
      this.searchTermSubject.next('');
    }
    const sanitizedInput = input.replace(/\D/g, '');
    term.target.value = sanitizedInput;
    if (sanitizedInput) {
      this.searchTermSubject.next(sanitizedInput);
    }
  }

  async getMaleLockers(
    limit = this.limit,
    page = this.page,
    number = this.number,
    gender = this.gender,
    status = this.status,
  ): Promise<void> {
    this.maleLockersService
      .callGetList(limit, page, number, gender, status)
      .subscribe();
  }

  get maleLockers(): Observable<Locker[]> {
    return this.maleLockersService.getList();
  }

  get maleLockertotal(): Observable<number> {
    return this.maleLockersService.getTotal();
  }

  async getFemaleLockers(
    limit = this.femaleLimit,
    page = this.femalePage,
    number = this.femaleNumber,
    gender = this.femaleGender,
    status = this.femaleStatus,
  ): Promise<void> {
    this.femaleLockersService
      .callGetList(limit, page, number, gender, status)
      .subscribe();
  }

  get femaleLockers(): Observable<Locker[]> {
    return this.femaleLockersService.getList();
  }

  get femaleLockertotal(): Observable<number> {
    return this.femaleLockersService.getTotal();
  }

  femaleStatusChange(event: any) {
    if (event.value?.value == 1) {
      this.first = (this.femalePage - 1) * this.femaleLimit;
      this.femaleStatus = 'AVAILABLE';
      this.femaleStatusSelected = this.statusOptions[0];
      this.getFemaleLockers(
        this.femaleLimit,
        this.femalePage,
        this.femaleNumber,
        this.femaleGender,
        this.femaleStatus,
      );
    } else {
      this.firstFemale = (this.femalePage - 1) * this.femaleLimit;
      this.femaleStatus = 'IN_USE';
      this.femaleStatusSelected = this.statusOptions[1];
      this.getLockers(
        this.lockerLimit,
        this.lockerPage,
        this.lockerNumber,
        this.lockerStatus,
      );
    }
  }

  onFemaleLockerPageChange(event: any) {
    this.femalePage = event.page + 1;
    this.firstFemale = event.first;
    this.getFemaleLockers(
      this.femaleLimit,
      this.femalePage,
      this.femaleNumber,
      this.femaleGender,
      this.femaleStatus,
    );
  }

  onFemaleFilter(term: any) {
    const input = term.target.value;
    if (input == '') {
      this.searchFemaleTermSubject.next('');
    }
    const sanitizedInput = input.replace(/\D/g, '');
    term.target.value = sanitizedInput;
    if (sanitizedInput) {
      this.searchFemaleTermSubject.next(sanitizedInput);
    }
  }

  async getLockers(
    limit = this.lockerLimit,
    page = this.lockerPage,
    number = this.lockerNumber,
    status = this.lockerStatus,
  ): Promise<void> {
    this.lockersService.callGetList(limit, page, number, status).subscribe();
  }

  get lockers(): Observable<Locker[]> {
    return this.lockersService.getList();
  }

  get lockertotal(): Observable<number> {
    return this.lockersService.getTotal();
  }

  onLockerPageChange(event: any) {
    this.lockerPage = event.page + 1;
    this.firstLocker = event.first;
    this.getLockers(
      this.lockerLimit,
      this.lockerPage,
      this.lockerNumber,
      this.lockerStatus,
    );
  }

  onLockerFilter(term: any) {
    const input = term.target.value;
    if (input == '') {
      this.searchLockerTermSubject.next('');
    }
    const sanitizedInput = input.replace(/\D/g, '');
    term.target.value = sanitizedInput;
    if (sanitizedInput) {
      this.searchLockerTermSubject.next(sanitizedInput);
    }
  }
}
