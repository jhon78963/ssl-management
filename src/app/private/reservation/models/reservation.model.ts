export interface IReservation {
  id?: number;
  initialReservationDate?: string | null;
  finalReservationDate?: string | null;
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
  facilitiesImport?: number;
  consumptionsImport?: number;
  extraImport?: number;
  brokenThingsImport?: number;
}

export class Reservation {
  [x: string]: any;
  id?: number;
  initialReservationDate?: string | null;
  finalReservationDate?: string | null;
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
    this.initialReservationDate = reservation.initialReservationDate;
    this.finalReservationDate = reservation.finalReservationDate;
    this.total = reservation.total;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.lockerId = reservation.lockerId;
    this.roomId = reservation.roomId;
    this.customers = reservation.customers;
    this.reservationTypeId = reservation.reservationTypeId;
    this.status = reservation.status;
  }
}

export class RoomReservation {
  id?: number;
  initialReservationDate?: string | null;
  finalReservationDate?: string | null;
  total: number;
  totalPaid: number;
  reservationTypeId: number;
  roomId?: number;
  customerId?: number;
  customers?: any[];
  products?: any[];
  services?: any[];
  status?: string;
  facilitiesImport?: number;
  consumptionsImport?: number;
  extraImport?: number;
  brokenThingsImport?: number;
  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.initialReservationDate = reservation.initialReservationDate;
    this.finalReservationDate = reservation.finalReservationDate;
    this.total = reservation.total;
    this.totalPaid = reservation.totalPaid;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.facilitiesImport = reservation.facilitiesImport;
    this.consumptionsImport = reservation.consumptionsImport;
    this.extraImport = reservation.extraImport;
    this.brokenThingsImport = reservation.brokenThingsImport;
    this.status = reservation.status;
    this.reservationTypeId = 2;
  }
}

export class LockerReservation {
  id?: number;
  initialReservationDate?: string | null;
  finalReservationDate?: string | null;
  total: number;
  totalPaid: number;
  customerId?: number;
  products?: any[];
  services?: any[];
  reservationTypeId: number;
  status?: string;
  facilitiesImport?: number;
  consumptionsImport?: number;
  extraImport?: number;
  brokenThingsImport?: number;
  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.initialReservationDate = reservation.initialReservationDate;
    this.finalReservationDate = reservation.finalReservationDate;
    this.total = reservation.total;
    this.totalPaid = reservation.totalPaid;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.facilitiesImport = reservation.facilitiesImport;
    this.consumptionsImport = reservation.consumptionsImport;
    this.extraImport = reservation.extraImport;
    this.brokenThingsImport = reservation.brokenThingsImport;
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
