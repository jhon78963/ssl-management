export interface IReservation {
  id?: number;
  reservationDate?: string | null;
  total: string;
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
  id?: number;
  reservationDate?: string | null;
  total: string;
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
  total: string;
  reservationTypeId: number;
  roomId?: number;
  customers?: any[];
  products?: any[];
  services?: any[];

  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.reservationDate = reservation.reservationDate;
    this.total = reservation.total;
    this.products = reservation.products;
    this.services = reservation.services;
    this.roomId = reservation.roomId;
    this.customers = reservation.customers;
    this.reservationTypeId = 2;
  }
}

export class CustomerReservation {
  id?: number;
  reservationDate?: string | null;
  total: string;
  customerId?: number;
  lockerId?: number;
  products?: any[];
  services?: any[];
  reservationTypeId: number;
  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.reservationDate = reservation.reservationDate;
    this.total = reservation.total;
    this.customerId = reservation.customerId;
    this.lockerId = reservation.lockerId;
    this.products = reservation.products;
    this.services = reservation.services;
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
