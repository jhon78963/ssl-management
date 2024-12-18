export interface IReservation {
  id?: number;
  reservationDate?: string | null;
  total: number;
  totalPaid: number;
  reservationTypeId?: number;
  status?: string;
  products?: any[];
  services?: any[];
  customerId?: number;
  customer?: string;
  lockerId?: number;
  locker?: string;
  roomId?: number;
  room?: string;
  customers?: any[];
}

export class Reservation {
  [x: string]: any;
  id?: number;
  reservationDate?: string | null;
  total: number;
  reservationTypeId?: number;
  status?: string;
  products?: any[];
  services?: any[];
  customerId?: number;
  lockerId?: number;
  roomId?: number;
  customers?: any[];

  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.reservationDate = reservation.reservationDate;
    this.total = reservation.total;
    this.status = reservation.status;
    this.products = reservation.products;
    this.services = reservation.services;
    this.customerId = reservation.customerId;
    this.lockerId = reservation.lockerId;
    this.roomId = reservation.roomId;
    this.customers = reservation.customers;
    this.reservationTypeId = reservation.reservationTypeId;
  }
}

export class RoomReservation {
  id?: number;
  reservationDate?: string | null;
  total: number;
  totalPaid: number;
  reservationTypeId: number;
  roomId?: number;
  customerId?: number;
  customers?: any[];
  products?: any[];
  services?: any[];
  status?: string;
  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.reservationDate = reservation.reservationDate;
    this.total = reservation.total;
    this.totalPaid = reservation.totalPaid;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.status = reservation.status;
    this.reservationTypeId = 2;
  }
}

export class LockerReservation {
  id?: number;
  reservationDate?: string | null;
  total: number;
  totalPaid: number;
  customerId?: number;
  products?: any[];
  services?: any[];
  reservationTypeId: number;
  status?: string;
  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.reservationDate = reservation.reservationDate;
    this.total = reservation.total;
    this.totalPaid = reservation.totalPaid;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.status = reservation.status;
    this.reservationTypeId = 1;
  }
}

export interface CreatedReservation {
  message: string;
  reservationId: number;
}

export interface IFinishReservation {
  id: number;
  status: string;
  total: number;
}

export class FinishReservation {
  id: number;
  status: string;
  total: number;

  constructor(reservation: IFinishReservation) {
    this.id = reservation.id;
    this.status = reservation.status;
    this.total = reservation.total;
  }
}

export interface IConsumptionReservation {
  id: number;
  total: number;
}

export class ConsumptionReservation {
  id: number;
  total: number;

  constructor(reservation: IConsumptionReservation) {
    this.id = reservation.id;
    this.total = reservation.total;
  }
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface ReservationListResponse {
  data: Reservation[];
  paginate: Paginate;
}
