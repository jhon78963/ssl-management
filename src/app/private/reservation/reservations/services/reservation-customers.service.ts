import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationCustomersService {
  constructor(private readonly apiService: ApiService) {}

  add(
    reservationId: number,
    customerId: number,
    price: number,
  ): Observable<void> {
    return this.apiService.post(
      `customers/${reservationId}/add/${customerId}`,
      { price },
    );
  }

  remove(reservationId: number, customerId: number): Observable<void> {
    return this.apiService.delete(
      `customers/${reservationId}/remove/${customerId}`,
    );
  }
}
