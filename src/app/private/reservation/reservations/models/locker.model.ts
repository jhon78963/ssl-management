export interface ILocker {
  id: number;
  number: number;
  status: string;
  genderId: number;
  gender: string;
}

export class Locker {
  id: number;
  number: number;
  status: string;
  genderId: number;
  gender: string;

  constructor(locker: ILocker) {
    this.id = locker.id;
    this.number = locker.number;
    this.status = locker.status;
    this.genderId = locker.genderId;
    this.gender = locker.gender;
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
