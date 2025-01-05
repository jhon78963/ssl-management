import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
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
      `reservations/${reservationId}/payment-types/${paymentTypeId}`,
      {
        payment,
        cashPayment,
        cardPayment,
      },
    );
  }

  remove(
    reservationId: number,
    paymentTypeId: number,
    payment: number,
    cashPayment: number,
    cardPayment: number,
  ): Observable<void> {
    return this.apiService.delete(
      `reservations/${reservationId}/payment-types/${paymentTypeId}/payment/${payment}cash-payment/${cashPayment}/card-payment/${cardPayment}`,
    );
  }
}
