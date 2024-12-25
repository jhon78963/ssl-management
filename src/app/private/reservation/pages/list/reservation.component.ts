import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { CallToAction, Column } from '../../../../interfaces/table.interface';
import { Reservation } from '../../models/reservation.model';
import { debounceTime, Observable, Subject } from 'rxjs';
import { PaginatorState } from 'primeng/paginator';
import { ReservationsService } from '../../services/reservations.service';
import { LoadingService } from '../../../../services/loading.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
})
export class ReservationListComponent implements OnInit {
  columns: Column[] = [
    { header: '#', field: 'id', clickable: false, image: false },
    {
      header: 'Fecha de entrada',
      field: 'initialReservationDate',
      clickable: false,
      image: false,
    },
    {
      header: 'Fecha de salida',
      field: 'finalReservationDate',
      clickable: false,
      image: false,
    },
    {
      header: 'Tipo de reserva',
      field: 'reservationType',
      clickable: false,
      image: false,
    },
    {
      header: 'Importe',
      field: 'facilitiesImport',
      clickable: false,
      image: false,
    },
    {
      header: 'Importe extra',
      field: 'extraImport',
      clickable: false,
      image: false,
    },
    {
      header: 'Cosas rotas',
      field: 'brokenThingsImport',
      clickable: false,
      image: false,
    },
    {
      header: 'Consumo',
      field: 'consumptionsImport',
      clickable: false,
      image: false,
    },
    {
      header: 'Total',
      field: 'total',
      clickable: false,
      image: false,
    },
    {
      header: 'Estado',
      field: 'status',
      clickable: false,
      image: false,
    },
  ];
  cellToAction: any;
  data: any[] = [];
  limit: number = 10;
  page: number = 1;
  description: string = '';
  callToAction: CallToAction<Reservation>[] = [];

  private searchTermSubject = new Subject<string>();

  constructor(
    private readonly reservationsService: ReservationsService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.getReservations(this.limit, this.page, this.description);
    this.searchTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.loadingService.sendLoadingState(true);
      this.getReservations(this.limit, this.page, this.description);
    });
  }

  clearFilter(): void {
    this.description = '';
    this.onSearchTermChange('');
  }

  onSearchTermChange(term: any): void {
    this.searchTermSubject.next(term);
  }

  async getReservations(
    limit = this.limit,
    page = this.page,
    description = this.description,
  ): Promise<void> {
    this.updatePage(page);
    this.reservationsService.callGetList(limit, page, description).subscribe();
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
