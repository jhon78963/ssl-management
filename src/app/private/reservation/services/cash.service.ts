import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import {
  Cash,
  CashOperation,
  CashTotal,
  CashType,
  CashUpdate,
  CurrentCash,
} from '../models/cash.model';
import { Schedule } from '../models/schedule.model';

@Injectable({
  providedIn: 'root',
})
export class CashService {
  total: number = 0;
  total$: BehaviorSubject<number> = new BehaviorSubject<number>(this.total);

  cashTotal: number = 0;
  cashTotal$: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.cashTotal,
  );

  cardTotal: number = 0;
  cardTotal$: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.cardTotal,
  );

  cashType: CashType = { id: 0, key: '', label: '' };
  cashType$: BehaviorSubject<CashType> = new BehaviorSubject<CashType>(
    this.cashType,
  );

  constructor(private apiService: ApiService) {}

  getCashTotal(): Observable<void> {
    return this.apiService.get<CashTotal>(`cash-operations/total`).pipe(
      map((cash: CashTotal) => {
        this.updateCashTotal(cash.amount);
        this.updateCashCashTotal(cash.cashAmount);
        this.updateCardCashTotal(cash.cardAmount);
      }),
    );
  }

  getTotal(): Observable<number> {
    return this.total$.asObservable();
  }

  getCashTotalAmount(): Observable<number> {
    return this.cashTotal$.asObservable();
  }

  getCardTotalAmount(): Observable<number> {
    return this.cardTotal$.asObservable();
  }

  getCashValidate(): Observable<void> {
    return this.apiService.get<CashType>(`cash-types/get`).pipe(
      map((cash: CashType) => {
        this.updateCashType(cash);
      }),
    );
  }

  getCashType(): Observable<CashType> {
    return this.cashType$.asObservable();
  }

  updateCashTotal(mount: number): void {
    this.total = mount;
    this.total$.next(mount);
  }

  updateCashCashTotal(mount: number): void {
    this.cashTotal = mount;
    this.cashTotal$.next(mount);
  }

  updateCardCashTotal(mount: number): void {
    this.cardTotal = mount;
    this.cardTotal$.next(mount);
  }

  updateCashType(cashType: CashType): void {
    this.cashType = cashType;
    this.cashType$.next(cashType);
  }

  createOperation(body: CashOperation): Observable<void> {
    return this.apiService.post('cash-operations', body);
  }

  createCash(body: Cash): Observable<void> {
    return this.apiService.post('cashes', body);
  }

  updateCash(id: number, body: CashUpdate): Observable<void> {
    return this.apiService.put(`cashes/${id}`, body);
  }

  currentCash(): Observable<CurrentCash> {
    return this.apiService.get('cashes/current');
  }

  currentSchedule(): Observable<Schedule> {
    return this.apiService.get('schedules/current');
  }
}
