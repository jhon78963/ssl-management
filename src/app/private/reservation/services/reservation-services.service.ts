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
    return this.apiService.post(`services/${reservationId}/add/${serviceId}`, {
      quantity,
      isPaid,
      isFree,
    });
  }

  modify(
    reservationId: number,
    serviceId: number,
    quantity: number,
    isPaid: boolean = false,
    isFree: boolean = false,
  ): Observable<void> {
    return this.apiService.post(
      `services/${reservationId}/modify/${serviceId}`,
      {
        quantity,
        isPaid,
        isFree,
      },
    );
  }

  findAll(id: number): Observable<Service[]> {
    return this.apiService.get(`services/${id}/all`);
  }

  findLeft(id: number): Observable<Service[]> {
    return this.apiService.get(`services/${id}/left`);
  }

  remove(
    reservationId: number,
    serviceId: number,
    quantity: number,
  ): Observable<void> {
    return this.apiService.delete(
      `services/${reservationId}/remove/${serviceId}/quantity/${quantity}`,
    );
  }
}
