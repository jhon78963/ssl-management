import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

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

  findAll(id: number): Observable<Customer[]> {
    return this.apiService.get(`customers/${id}/all`);
  }

  remove(
    reservationId: number,
    customerId: number,
    price: number,
  ): Observable<void> {
    return this.apiService.delete(
      `customers/${reservationId}/remove/${customerId}/price/${price}`,
    );
  }
}
