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
  ): Observable<void> {
    return this.apiService.post(`products/${reservationId}/add/${productId}`, {
      quantity,
      isPaid,
    });
  }

  modify(
    reservationId: number,
    productId: number,
    quantity: number,
    isPaid: boolean = false,
  ): Observable<void> {
    return this.apiService.post(
      `products/${reservationId}/modify/${productId}`,
      {
        quantity,
        isPaid,
      },
    );
  }

  findAll(id: number): Observable<Product[]> {
    return this.apiService.get(`products/${id}/all`);
  }

  findLeft(id: number): Observable<Product[]> {
    return this.apiService.get(`products/${id}/left`);
  }

  remove(
    reservationId: number,
    productId: number,
    quantity: number,
  ): Observable<void> {
    return this.apiService.delete(
      `products/${reservationId}/remove/${productId}/quantity/${quantity}`,
    );
  }
}
