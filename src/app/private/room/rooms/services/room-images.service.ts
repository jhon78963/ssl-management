import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Observable } from 'rxjs';
import { Image } from '../models/rooms.model';

@Injectable({
  providedIn: 'root',
})
export class RoomImagesService {
  constructor(private readonly apiService: ApiService) {}

  findAll(id: number): Observable<Image[]> {
    return this.apiService.get(`images/${id}/all`);
  }

  remove(roomId: number, imageId: number): Observable<void> {
    return this.apiService.delete(`images/${roomId}/remove/${imageId}`);
  }
}
