export interface ILocker {
  id: number;
  number: number;
  price: number;
  priceString: string;
  status: string;
  genderId: number;
  gender?: string;
  reservationId?: number;
  customerDni?: string;
  customerName?: string;
  customerSurname?: string;
}

export class Locker {
  id: number;
  number: number;
  price: number;
  status: string;
  genderId: number;
  gender?: string;
  reservationId?: number;
  customerDni?: string;
  customerName?: string;
  customerSurname?: string;

  constructor(locker: ILocker) {
    this.id = locker.id;
    this.number = locker.number;
    this.price = locker.price;
    this.status = locker.status;
    this.genderId = locker.genderId;
  }
}

export interface IStatusLocker {
  id: number;
  status: string;
}

export class StatusLocker {
  id: number;
  status: string;

  constructor(locker: IStatusLocker) {
    this.id = locker.id;
    this.status = locker.status;
  }
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface LockerListResponse {
  data: Locker[];
  paginate: Paginate;
}
