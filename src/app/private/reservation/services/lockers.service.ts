import { Injectable } from '@angular/core';
import { Locker, LockerListResponse } from '../models/locker.model';
import { BehaviorSubject, debounceTime, map, Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class LockersService {
  lockers: Locker[] = [];
  lockers$: BehaviorSubject<Locker[]> = new BehaviorSubject<Locker[]>(
    this.lockers,
  );

  total: number = 0;
  total$: BehaviorSubject<number> = new BehaviorSubject<number>(this.total);

  constructor(private apiService: ApiService) {}

  callGetList(
    limit: number = 12,
    page: number = 1,
    number: string = '',
    status: string = 'IN_USE',
  ): Observable<void> {
    let url = `lockers?limit=${limit}&page=${page}&status=${status}`;
    if (number) {
      url += `&search=${number}`;
    }
    return this.apiService.get<LockerListResponse>(url).pipe(
      debounceTime(600),
      map((response: LockerListResponse) => {
        this.updateLockers(response.data);
        this.updateTotalLockers(response.paginate.total);
      }),
    );
  }

  getList(): Observable<Locker[]> {
    return this.lockers$.asObservable();
  }

  getTotal(): Observable<number> {
    return this.total$.asObservable();
  }

  getMaleLockers(): Observable<Locker[]> {
    return this.apiService.get('lockers/male');
  }

  getFemaleLockers(): Observable<Locker[]> {
    return this.apiService.get('lockers/female');
  }

  private updateLockers(value: Locker[]): void {
    this.lockers = value;
    this.lockers$.next(this.lockers);
  }

  private updateTotalLockers(value: number): void {
    this.total = value;
    this.total$.next(this.total);
  }
}
