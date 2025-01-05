import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationProductsService {
  constructor(private readonly apiService: ApiService) {}

  add(
    reservationId: number,
    productId: number,
    quantity: number,
    isPaid: boolean = false,
    isFree: boolean = false,
  ): Observable<void> {
    return this.apiService.post(
      `reservations/${reservationId}/products/${productId}`,
      {
        quantity,
        isPaid,
        isFree,
      },
    );
  }

  modify(
    reservationId: number,
    productId: number,
    quantity: number,
    isPaid: boolean = false,
    isFree: boolean = false,
  ): Observable<void> {
    return this.apiService.patch(
      `reservations/${reservationId}/products/${productId}`,
      {
        quantity,
        isPaid,
        isFree,
      },
    );
  }

  findAll(reservationId: number): Observable<Product[]> {
    return this.apiService.get(`reservations/${reservationId}/products/all`);
  }

  findLeft(reservationId: number): Observable<Product[]> {
    return this.apiService.get(`reservations/${reservationId}/products/left`);
  }

  remove(
    reservationId: number,
    productId: number,
    quantity: number,
  ): Observable<void> {
    return this.apiService.delete(
      `reservations/${reservationId}/products/${productId}/quantity/${quantity}`,
    );
  }
}
