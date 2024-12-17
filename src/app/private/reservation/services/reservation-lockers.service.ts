import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { Locker } from '../models/locker.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationLockersService {
  constructor(private readonly apiService: ApiService) {}

  add(
    reservationId: number,
    lockerId: number,
    price: number,
    isPaid: boolean = false,
  ): Observable<void> {
    return this.apiService.post(`lockers/${reservationId}/add/${lockerId}`, {
      price,
      isPaid,
    });
  }

  modify(
    reservationId: number,
    lockerId: number,
    isPaid: boolean = false,
  ): Observable<void> {
    return this.apiService.post(`lockers/${reservationId}/modify/${lockerId}`, {
      isPaid,
    });
  }

  findAll(id: number): Observable<Locker[]> {
    return this.apiService.get(`lockers/${id}/all`);
  }

  remove(
    reservationId: number,
    lockerId: number,
    price: number,
  ): Observable<void> {
    return this.apiService.delete(
      `lockers/${reservationId}/remove/${lockerId}/price/${price}`,
    );
  }
}
