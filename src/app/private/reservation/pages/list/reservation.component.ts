import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorState } from 'primeng/paginator';
import { Observable } from 'rxjs';
import { CallToAction, Column } from '../../../../interfaces/table.interface';
import { LoadingService } from '../../../../services/loading.service';
import { SharedModule } from '../../../../shared/shared.module';
import { ReservationType } from '../../models/reservation-type.model';
import { Reservation } from '../../models/reservation.model';
import { ReservationExportsService } from '../../services/reservations/reservation-exports.service';
import { ReservationTypesService } from '../../services/reservations/reservation-types.service';
import { ReservationsService } from '../../services/reservations/reservations.service';
import { ReservationSchedulesService } from '../../services/reservations/reservation-schedules.service';
import { Schedule } from '../../models/schedule.model';
import { CashService } from '../../services/cash.service';
import { formatDate } from '../../../../utils/dates';

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
      header: 'Fecha de entrada',
      field: 'startDateF',
      clickable: false,
      image: false,
      money: false,
    },
    {
      header: 'Fecha de salida',
      field: 'endDate',
      clickable: false,
      image: false,
      money: false,
    },
    {
      header: 'Caja',
      field: 'cash',
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
      header: 'Turno',
      field: 'schedule',
      clickable: false,
      image: false,
      money: false,
    },
    {
      header: 'L/H',
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

  schedules: Schedule[] = [{ id: 0, description: 'Todos' }];
  selectedSchedule: Schedule = this.schedules[0];

  constructor(
    private readonly datePipe: DatePipe,
    private readonly reservationsService: ReservationsService,
    private readonly reservationTypesService: ReservationTypesService,
    private readonly reservationSchedulesService: ReservationSchedulesService,
    private readonly reservationExportsService: ReservationExportsService,
    private readonly cashService: CashService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.getReservationTypes();
    this.getSchedules();
    this.getReservations(
      this.limit,
      this.page,
      this.selectedReservationType.id,
      this.selectedSchedule.id,
      formatDate(this.startDate, this.datePipe),
      formatDate(this.endDate, this.datePipe),
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

  getSchedules() {
    this.reservationSchedulesService.getSchedules().subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules = schedules;
        if (schedules.length > 1) {
          this.cashService.currentSchedule().subscribe({
            next: (schedule: Schedule) => {
              this.selectedSchedule = schedule;
              this.getReservations(
                this.limit,
                this.page,
                this.selectedReservationType.id,
                this.selectedSchedule.id,
                formatDate(this.startDate, this.datePipe),
                formatDate(this.endDate, this.datePipe),
              );
            },
          });
        }
      },
    });
  }

  filterReservationType(reservationType: ReservationType) {
    this.selectedReservationType = reservationType;
    this.getReservations(
      this.limit,
      this.page,
      this.selectedReservationType.id,
      this.selectedSchedule.id,
      formatDate(this.startDate, this.datePipe),
      formatDate(this.endDate, this.datePipe),
    );
  }

  filterSchedule(schedule: Schedule) {
    this.selectedSchedule = schedule;
    this.getReservations(
      this.limit,
      this.page,
      this.selectedReservationType.id,
      this.selectedSchedule.id,
      formatDate(this.startDate, this.datePipe),
      formatDate(this.endDate, this.datePipe),
    );
  }

  filterStartDate(startDate: Date) {
    this.getReservations(
      this.limit,
      this.page,
      this.selectedReservationType.id,
      this.selectedSchedule.id,
      formatDate(startDate, this.datePipe),
      formatDate(this.endDate, this.datePipe),
    );
  }

  filterEndDate(endDate: Date) {
    this.getReservations(
      this.limit,
      this.page,
      this.selectedReservationType.id,
      this.selectedSchedule.id,
      formatDate(this.startDate, this.datePipe),
      formatDate(endDate, this.datePipe),
    );
  }

  async getReservations(
    limit = this.limit,
    page = this.page,
    reservationType = this.selectedReservationType.id,
    schedule = this.selectedSchedule.id,
    startDate = formatDate(this.startDate, this.datePipe),
    endDate = formatDate(this.endDate, this.datePipe),
  ): Promise<void> {
    this.updatePage(page);
    this.reservationsService
      .callGetList(limit, page, reservationType, schedule, startDate, endDate)
      .subscribe();
    setTimeout(() => {
      this.loadingService.sendLoadingState(false);
    }, 600);
  }

  export() {
    this.reservationExportsService
      .export(
        formatDate(this.startDate, this.datePipe),
        formatDate(this.endDate, this.datePipe),
        this.selectedReservationType.id.toString(),
        this.selectedSchedule.id!.toString(),
      )
      .subscribe({
        next: (data: any) => {
          const blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `export.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        },
      });
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
