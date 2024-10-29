import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationServicesService {
  constructor(private readonly apiService: ApiService) {}

  add(reservationId: number, serviceId: number): Observable<void> {
    return this.apiService.post(
      `services/${reservationId}/add/${serviceId}`,
      {},
    );
  }

  findAll(id: number): Observable<Service[]> {
    return this.apiService.get(`services/${id}/all`);
  }

  findLeft(id: number): Observable<Service[]> {
    return this.apiService.get(`services/${id}/left`);
  }

  remove(reservationId: number, serviceId: number): Observable<void> {
    return this.apiService.delete(
      `services/${reservationId}/remove/${serviceId}`,
    );
  }
}
