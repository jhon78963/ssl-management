import { Injectable } from '@angular/core';

import {
  BehaviorSubject,
  debounceTime,
  map,
  Observable,
  switchMap,
} from 'rxjs';

import { ApiService } from '../../../../services/api.service';

import {
  CreatedReservation,
  FinishReservation,
  Reservation,
  ReservationListResponse,
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  reservations: Reservation[] = [];
  reservations$: BehaviorSubject<Reservation[]> = new BehaviorSubject<
    Reservation[]
  >(this.reservations);

  total: number = 0;
  total$: BehaviorSubject<number> = new BehaviorSubject<number>(this.total);

  constructor(private apiService: ApiService) {}

  callGetList(
    limit: number = 10,
    page: number = 1,
    date: string = '',
  ): Observable<void> {
    let url = `reservations?limit=${limit}&page=${page}`;
    if (date) {
      url += `&search=${date}`;
    }
    return this.apiService.get<ReservationListResponse>(url).pipe(
      debounceTime(600),
      map((response: ReservationListResponse) => {
        this.updateReservations(response.data);
        this.updateTotalReservations(response.paginate.total);
      }),
    );
  }

  getList(): Observable<Reservation[]> {
    return this.reservations$.asObservable();
  }

  getTotal(): Observable<number> {
    return this.total$.asObservable();
  }

  getOne(id: number): Observable<Reservation> {
    return this.apiService.get(`reservations/${id}`);
  }

  // create(data: Reservation): Observable<any> {
  //   return this.apiService
  //     .post('reservations', data)
  //     .pipe(switchMap(() => this.callGetList()));
  // }

  create(data: Reservation): Observable<CreatedReservation> {
    return this.apiService.post<CreatedReservation>('reservations', data).pipe(
      switchMap((createdReservation: CreatedReservation) => {
        // Después de crear, actualizamos la lista de reservas
        return this.callGetList().pipe(
          map(() => createdReservation), // Regresamos la reserva creada
        );
      }),
    );
  }

  edit(id: number, data: Reservation | FinishReservation): Observable<void> {
    return this.apiService
      .patch(`reservations/${id}`, data)
      .pipe(switchMap(() => this.callGetList()));
  }

  delete(id: number): Observable<void> {
    return this.apiService
      .delete(`reservations/${id}`)
      .pipe(switchMap(() => this.callGetList()));
  }

  private updateReservations(value: Reservation[]): void {
    this.reservations = value;
    this.reservations$.next(this.reservations);
  }

  private updateTotalReservations(value: number): void {
    this.total = value;
    this.total$.next(this.total);
  }
}
