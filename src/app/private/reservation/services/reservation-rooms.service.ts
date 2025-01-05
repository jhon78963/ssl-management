import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { Room } from '../../room/rooms/models/rooms.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationRoomsService {
  constructor(private readonly apiService: ApiService) {}

  add(
    reservationId: number,
    roomId: number,
    price: number,
    isPaid: boolean = false,
    additionalPeople: number = 0,
    extraHours: number = 0,
  ): Observable<void> {
    return this.apiService.post(
      `reservations/${reservationId}/rooms/${roomId}`,
      {
        price,
        isPaid,
        additionalPeople,
        extraHours,
      },
    );
  }

  modify(
    reservationId: number,
    roomId: number,
    isPaid: boolean = false,
    additionalPeople: number = 0,
    extraHours: number = 0,
  ): Observable<void> {
    return this.apiService.patch(
      `reservations/${reservationId}/rooms/${roomId}`,
      {
        isPaid,
        additionalPeople,
        extraHours,
      },
    );
  }

  findAll(reservationId: number): Observable<Room[]> {
    return this.apiService.get(`reservations/${reservationId}/rooms`);
  }

  remove(
    reservationId: number,
    roomId: number,
    price: number,
  ): Observable<void> {
    return this.apiService.delete(
      `reservations/${reservationId}/rooms/${roomId}/price/${price}`,
    );
  }
}
