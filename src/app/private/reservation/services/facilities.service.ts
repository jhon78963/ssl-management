import { Injectable } from '@angular/core';
import { Facility } from '../models/facility.model';
import { BehaviorSubject, debounceTime, map, Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { StatusLocker } from '../models/locker.model';

@Injectable({
  providedIn: 'root',
})
export class FacilitiesService {
  facilities: Facility[] = [];
  facilities$: BehaviorSubject<Facility[]> = new BehaviorSubject<Facility[]>(
    this.facilities,
  );

  constructor(private apiService: ApiService) {}

  callGetList(): Observable<void> {
    return this.apiService.get<Facility[]>('reservations/facilities').pipe(
      debounceTime(600),
      map((facility: Facility[]) => {
        this.updateFacilities(facility);
      }),
    );
  }

  getList(): Observable<Facility[]> {
    return this.facilities$.asObservable();
  }

  changeLockerStatus(id: number, data: StatusLocker) {
    return this.apiService.patch(`lockers/change-status/${id}`, data);
  }

  changeRoomStatus(id: number, data: StatusLocker) {
    return this.apiService.patch(`rooms/change-status/${id}`, data);
  }

  private updateFacilities(value: Facility[]): void {
    this.facilities = value;
    this.facilities$.next(this.facilities);
  }
}
