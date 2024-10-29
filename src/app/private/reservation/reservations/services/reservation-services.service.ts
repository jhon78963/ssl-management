import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationServicesService {
  constructor(private readonly apiService: ApiService) {}

  add(roomId: number, serviceId: number): Observable<void> {
    return this.apiService.post(`services/${roomId}/add/${serviceId}`, {});
  }

  findAll(id: number): Observable<Service[]> {
    return this.apiService.get(`services/${id}/all`);
  }

  findLeft(id: number): Observable<Service[]> {
    return this.apiService.get(`services/${id}/left`);
  }

  remove(roomId: number, serviceId: number): Observable<void> {
    return this.apiService.delete(`services/${roomId}/remove/${serviceId}`);
  }
}
