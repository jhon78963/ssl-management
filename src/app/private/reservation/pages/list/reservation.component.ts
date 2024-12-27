import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PaginatorState } from 'primeng/paginator';
import { Observable } from 'rxjs';
import { CallToAction, Column } from '../../../../interfaces/table.interface';
import { LoadingService } from '../../../../services/loading.service';
import { SharedModule } from '../../../../shared/shared.module';
import { ReservationType } from '../../models/reservation-type.model';
import { Reservation } from '../../models/reservation.model';
import { ReservationTypesService } from '../../services/reservation-types.service';
import { ReservationsService } from '../../services/reservations.service';
import { DialogService } from 'primeng/dynamicdialog';
import { CashComponent } from '../../components/cash/cash.component';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
  providers: [DatePipe, DialogService],
})
export class ReservationListComponent implements OnInit {
  columns: Column[] = [
    {
      header: '#',
      field: 'id',
      clickable: false,
      image: false,
      money: false,
    },
    {
      header: 'Fecha de entrada',
      field: 'initialReservationDate',
      clickable: false,
      image: false,
      money: false,
    },
    {
      header: 'Fecha de salida',
      field: 'finalReservationDate',
      clickable: false,
      image: false,
      money: false,
    },
    {
      header: 'Tipo de reserva',
      field: 'reservationType',
      clickable: false,
      image: false,
      money: false,
    },
    {
      header: 'Locker/Room',
      field: 'facilitiesImport',
      clickable: false,
      image: false,
      money: true,
    },
    {
      header: 'Personas extras',
      field: 'peopleExtraImport',
      clickable: false,
      image: false,
      money: true,
    },
    {
      header: 'Horas extras',
      field: 'hoursExtraImport',
      clickable: false,
      image: false,
      money: true,
    },
    {
      header: 'Cosas rotas',
      field: 'brokenThingsImport',
      clickable: false,
      image: false,
      money: true,
    },
    {
      header: 'Consumo',
      field: 'consumptionsImport',
      clickable: false,
      image: false,
      money: true,
    },
    {
      header: 'Total',
      field: 'total',
      clickable: false,
      image: false,
      money: true,
    },
    {
      header: 'Estado',
      field: 'status',
      clickable: false,
      image: false,
      money: false,
    },
  ];
  cellToAction: any;
  data: any[] = [];
  limit: number = 10;
  page: number = 1;
  startDate: Date = new Date();
  endDate: Date = new Date();
  callToAction: CallToAction<Reservation>[] = [];
  reservationTypes: ReservationType[] = [{ id: 0, description: 'Todos' }];
  selectedReservationType: ReservationType = this.reservationTypes[0];

  constructor(
    private readonly datePipe: DatePipe,
    private readonly dialogService: DialogService,
    private readonly reservationsService: ReservationsService,
    private readonly reservationTypesService: ReservationTypesService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.getReservationTypes();
    this.getReservations(
      this.limit,
      this.page,
      this.selectedReservationType.id,
      this.parseDate(this.startDate),
      this.parseDate(this.endDate),
    );
  }

  getReservationTypes() {
    this.reservationTypesService.getReservationTypes().subscribe({
      next: (reservationTypes: ReservationType[]) => {
        this.reservationTypes = reservationTypes;
        this.selectedReservationType = this.reservationTypes[0];
      },
    });
  }

  parseDate(startDate: Date) {
    return this.datePipe.transform(startDate, 'yyyy-MM-dd');
  }

  filterReservationType(reservationType: ReservationType) {
    this.getReservations(
      this.limit,
      this.page,
      reservationType.id,
      this.parseDate(this.startDate),
      this.parseDate(this.endDate),
    );
  }

  filterStartDate(startDate: Date) {
    this.getReservations(
      this.limit,
      this.page,
      this.selectedReservationType.id,
      this.parseDate(startDate),
      this.parseDate(this.endDate),
    );
  }

  filterEndDate(endDate: Date) {
    this.getReservations(
      this.limit,
      this.page,
      this.selectedReservationType.id,
      this.parseDate(this.startDate),
      this.parseDate(endDate),
    );
  }

  cash() {
    const modalRef = this.dialogService.open(CashComponent, {
      header: 'Caja',
    });

    modalRef.onClose.subscribe({
      next: () => {},
    });
  }

  async getReservations(
    limit = this.limit,
    page = this.page,
    reservationType = this.selectedReservationType.id,
    startDate = this.parseDate(this.startDate),
    endDate = this.parseDate(this.endDate),
  ): Promise<void> {
    this.updatePage(page);
    this.reservationsService
      .callGetList(limit, page, reservationType, startDate, endDate)
      .subscribe();
    setTimeout(() => {
      this.loadingService.sendLoadingState(false);
    }, 600);
  }

  get reservations(): Observable<Reservation[]> {
    return this.reservationsService.getList();
  }

  get total(): Observable<number> {
    return this.reservationsService.getTotal();
  }

  async onPageSelected(event: PaginatorState) {
    this.updatePage((event.page ?? 0) + 1);
    this.getReservations(event.rows, this.page);
  }

  private updatePage(value: number): void {
    this.page = value;
  }
}
