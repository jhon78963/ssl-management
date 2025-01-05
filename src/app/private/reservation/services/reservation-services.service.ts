import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationServicesService {
  constructor(private readonly apiService: ApiService) {}

  add(
    reservationId: number,
    serviceId: number,
    quantity: number,
    isPaid: boolean = false,
    isFree: boolean = false,
  ): Observable<void> {
    return this.apiService.post(
      `reservations/${reservationId}/services/${serviceId}`,
      {
        quantity,
        isPaid,
        isFree,
      },
    );
  }

  modify(
    reservationId: number,
    serviceId: number,
    quantity: number,
    isPaid: boolean = false,
    isFree: boolean = false,
  ): Observable<void> {
    return this.apiService.patch(
      `reservations/${reservationId}/services/${serviceId}`,
      {
        quantity,
        isPaid,
        isFree,
      },
    );
  }

  findAll(reservationId: number): Observable<Service[]> {
    return this.apiService.get(`reservations/${reservationId}/services/all`);
  }

  findLeft(reservationId: number): Observable<Service[]> {
    return this.apiService.get(`reservations/${reservationId}/services/left`);
  }

  remove(
    reservationId: number,
    serviceId: number,
    quantity: number,
  ): Observable<void> {
    return this.apiService.delete(
      `reservations/${reservationId}/services/${serviceId}/quantity/${quantity}`,
    );
  }
}
