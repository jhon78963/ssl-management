import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationProductsService {
  constructor(private readonly apiService: ApiService) {}

  add(roomId: number, productId: number): Observable<void> {
    return this.apiService.post(`products/${roomId}/add/${productId}`, {});
  }

  findAll(id: number): Observable<Product[]> {
    return this.apiService.get(`products/${id}/all`);
  }

  findLeft(id: number): Observable<Product[]> {
    return this.apiService.get(`products/${id}/left`);
  }

  remove(roomId: number, productId: number): Observable<void> {
    return this.apiService.delete(`products/${roomId}/remove/${productId}`);
  }
}
