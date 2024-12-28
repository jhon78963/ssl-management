import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class ReservationExportsService {
  BASE_URL = BASE_URL;
  constructor(private http: HttpClient) {}

  export(startDate: string | null, endDate: string | null) {
    const url = `${this.BASE_URL}/reservations/export`;
    return this.http.post(
      url,
      { startDate, endDate },
      { responseType: 'blob' },
    );
  }
}
