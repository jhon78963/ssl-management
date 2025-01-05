import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Booking, CreatedBooking } from '../../models/booking.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private apiService: ApiService) {}

  create(data: Booking): Observable<CreatedBooking> {
    return this.apiService.post<CreatedBooking>('bookings', data);
  }

  // update(id: number, data: Booking): Observable<void> {
  //   return this.apiService.patch(`bookings/${id}`, data);
  // }
}
