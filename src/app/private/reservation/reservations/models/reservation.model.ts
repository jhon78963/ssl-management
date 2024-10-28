export interface IReservation {
  id: number;
  reservationDate: Date;
  total: string;
  status: string;
  products: any[];
  services: any[];
  customerId?: number;
  customer?: string;
  lockerId?: number;
  locker?: string;
  roomId?: number;
  room?: string;
  customers?: any[];
}

export class Reservation {
  id: number;
  reservationDate: Date;
  total: string;
  status: string;
  products: any[];
  services: any[];
  customerId?: number;
  customer?: string;
  lockerId?: number;
  locker?: string;
  roomId?: number;
  room?: string;
  customers?: any[];

  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.reservationDate = reservation.reservationDate;
    this.total = reservation.total;
    this.status = reservation.status;
    this.products = reservation.products;
    this.services = reservation.services;
    this.customerId = reservation.customerId;
    this.customer = reservation.customer;
    this.lockerId = reservation.lockerId;
    this.locker = reservation.locker;
    this.roomId = reservation.roomId;
    this.room = reservation.room;
    this.customers = reservation.customers;
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
