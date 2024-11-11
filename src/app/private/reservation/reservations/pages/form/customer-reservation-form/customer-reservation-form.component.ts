import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, Observable, Subject } from 'rxjs';
import { CheckoutComponent } from '../../../components/customers/checkout/checkout.component';
import { CustomerReservationComponent } from '../../../components/customers/reservation/reservation.component';
import { MassiveReservationComponent } from '../../../components/massive-reservation/massive-reservation.component';
import { Locker } from '../../../models/locker.model';
import { FemaleLockersService } from '../../../services/female-lockers.service';
import { MaleLockersService } from '../../../services/male-lockers.service';
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
    InfiniteScrollModule,
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

  loading: boolean = false;
  loadedLockers: Locker[] = [];

  selectedReservations: any[] = [];

  constructor(
    private readonly dialogService: DialogService,
    public messageService: MessageService,
    private readonly femaleLockersService: FemaleLockersService,
    private readonly maleLockersService: MaleLockersService,
  ) {}

  ngOnInit(): void {
    this.loadMoreLockers();
    this.maleLockers.subscribe(lockers => {
      this.loadedLockers = lockers;
    });
    // if (this.gender == 1) {
    //   this.getMaleLockers(this.limit, this.page, this.number, this.gender);
    // } else {
    //   this.getFemaleLockers(
    //     this.femaleLimit,
    //     this.femalePage,
    //     this.femaleNumber,
    //     this.femaleGender,
    //   );
    // }
    this.searchTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getMaleLockers(this.limit, this.page, this.number, this.gender);
    });
    this.searchFemaleTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getFemaleLockers(
        this.femaleLimit,
        this.femalePage,
        this.femaleNumber,
        this.femaleGender,
      );
    });
  }

  loadMoreLockers(): void {
    if (this.loading) return; // Evita llamadas duplicadas
    this.loading = true;

    // Llama a callGetList y actualiza loadedLockers
    this.maleLockersService.callGetList(this.limit, this.page).subscribe({
      next: (newLockers: any) => {
        this.loadedLockers = [...this.loadedLockers, ...newLockers]; // Añade lockers nuevos
        this.page += 1; // Incrementa el número de página
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar más lockers', error);
        this.loading = false;
      },
    });
  }

  genderChange(event: any) {
    if (event.value?.value == 1) {
      this.first = (this.page - 1) * this.limit;
      this.getMaleLockers(this.limit, this.page, this.number, this.gender);
    } else {
      this.firstFemale = (this.femalePage - 1) * this.femaleLimit;
      this.getFemaleLockers(
        this.femaleLimit,
        this.femalePage,
        this.femaleNumber,
        this.femaleGender,
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
    let pagination = {};
    if (locker.genderId == 1) {
      pagination = {
        limit: this.limit,
        page: this.page,
      };
    } else {
      pagination = {
        limit: this.femaleLimit,
        page: this.femalePage,
      };
    }
    this.modal = this.dialogService.open(CustomerReservationComponent, {
      data: {
        locker,
        pagination,
        create: true,
      },
      header: `Registrar Locker N° ${locker.number}`,
    });

    this.modal.onClose.subscribe({
      next: () => {
        this.loadMoreLockers();
        this.maleLockers.subscribe(lockers => {
          this.loadedLockers = [...this.loadedLockers, ...lockers];
        });
      },
    });
  }

  show(locker: Locker) {
    this.modal = this.dialogService.open(CustomerReservationComponent, {
      data: { locker },
      header: `Agregar servicios Locker N° ${locker.number}`,
    });
  }

  finish(locker: Locker) {
    let pagination = {};
    if (locker.genderId == 1) {
      pagination = {
        limit: this.limit,
        page: this.page,
      };
    } else {
      pagination = {
        limit: this.femaleLimit,
        page: this.femalePage,
      };
    }
    this.modal = this.dialogService.open(CheckoutComponent, {
      data: {
        locker,
        pagination,
      },
      header: `Checkout Locker N° ${locker.number}`,
    });

    this.modal.onClose.subscribe({
      next: () => {
        this.loadMoreLockers();
        this.maleLockers.subscribe(lockers => {
          this.loadedLockers = [...this.loadedLockers, ...lockers];
        });
      },
    });
  }

  onMaleLockerPageChange(event: any) {
    this.page = event.page + 1;
    this.first = event.first;
    this.getMaleLockers(this.limit, this.page, this.number, this.gender);
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
  ): Promise<void> {
    this.maleLockersService
      .callGetList(limit, page, number, gender)
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
  ): Promise<void> {
    this.femaleLockersService
      .callGetList(limit, page, number, gender)
      .subscribe();
  }

  get femaleLockers(): Observable<Locker[]> {
    return this.femaleLockersService.getList();
  }

  get femaleLockertotal(): Observable<number> {
    return this.femaleLockersService.getTotal();
  }

  onFemaleLockerPageChange(event: any) {
    this.femalePage = event.page + 1;
    this.firstFemale = event.first;
    this.getFemaleLockers(
      this.femaleLimit,
      this.femalePage,
      this.femaleNumber,
      this.femaleGender,
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
}
