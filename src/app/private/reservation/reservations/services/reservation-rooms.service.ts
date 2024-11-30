import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Observable } from 'rxjs';
import { Room } from '../../../room/rooms/models/rooms.model';

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
  ): Observable<void> {
    return this.apiService.post(`rooms/${reservationId}/add/${roomId}`, {
      price,
      isPaid,
    });
  }

  findAll(id: number): Observable<Room[]> {
    return this.apiService.get(`rooms/${id}/all`);
  }

  remove(
    reservationId: number,
    roomId: number,
    price: number,
  ): Observable<void> {
    return this.apiService.delete(
      `rooms/${reservationId}/remove/${roomId}/price/${price}`,
    );
  }
}
