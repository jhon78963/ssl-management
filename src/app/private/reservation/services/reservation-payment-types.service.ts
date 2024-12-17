import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationPaymentTypesService {
  constructor(private readonly apiService: ApiService) {}

  add(
    reservationId: number,
    paymentTypeId: number,
    payment: number,
    cashPayment: number,
    cardPayment: number,
  ): Observable<void> {
    return this.apiService.post(
      `payment-types/${reservationId}/add/${paymentTypeId}`,
      {
        payment,
        cashPayment,
        cardPayment,
      },
    );
  }

  findAll(id: number): Observable<any[]> {
    return this.apiService.get(`payment-types/${id}/all`);
  }

  remove(
    reservationId: number,
    paymentTypeId: number,
    payment: number,
    cashPayment: number,
    cardPayment: number,
  ): Observable<void> {
    return this.apiService.delete(
      `payment-types/${reservationId}/remove/${paymentTypeId}/payment/${payment}/cash-payment/${cashPayment}/card-payment/${cardPayment}`,
    );
  }
}
