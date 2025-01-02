export interface IReservation {
  id?: number;
  startDate?: string | null;
  endDate?: string | null;
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
  peopleExtraImport?: number;
  hoursExtraImport?: number;
  brokenThingsImport?: number;
  notes?: string;
}

export class Reservation {
  id?: number;
  startDate?: string | null;
  endDate?: string | null;
  total: number;
  reservationTypeId?: number;
  status?: string;
  products?: any[];
  services?: any[];
  customerId?: number;
  lockerId?: number;
  roomId?: number;
  customers?: any[];
  notes?: any;

  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.startDate = reservation.startDate;
    this.endDate = reservation.endDate;
    this.total = reservation.total;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.lockerId = reservation.lockerId;
    this.roomId = reservation.roomId;
    this.customers = reservation.customers;
    this.reservationTypeId = reservation.reservationTypeId;
    this.notes = reservation.notes;
    this.status = reservation.status;
  }
}

export class RoomReservation {
  id?: number;
  startDate?: string | null;
  endDate?: string | null;
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
  peopleExtraImport?: number;
  hoursExtraImport?: number;
  brokenThingsImport?: number;
  notes?: string;
  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.startDate = reservation.startDate;
    this.endDate = reservation.endDate;
    this.total = reservation.total;
    this.totalPaid = reservation.totalPaid;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.facilitiesImport = reservation.facilitiesImport;
    this.consumptionsImport = reservation.consumptionsImport;
    this.peopleExtraImport = reservation.peopleExtraImport;
    this.hoursExtraImport = reservation.hoursExtraImport;
    this.brokenThingsImport = reservation.brokenThingsImport;
    this.status = reservation.status;
    this.notes = reservation.notes;
    this.reservationTypeId = 2;
  }
}

export class LockerReservation {
  id?: number;
  startDate?: string | null;
  endDate?: string | null;
  total: number;
  totalPaid: number;
  customerId?: number;
  products?: any[];
  services?: any[];
  reservationTypeId: number;
  status?: string;
  facilitiesImport?: number;
  consumptionsImport?: number;
  peopleExtraImport?: number;
  hoursExtraImport?: number;
  brokenThingsImport?: number;
  notes?: string;
  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.startDate = reservation.startDate;
    this.endDate = reservation.endDate;
    this.total = reservation.total;
    this.totalPaid = reservation.totalPaid;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.facilitiesImport = reservation.facilitiesImport;
    this.consumptionsImport = reservation.consumptionsImport;
    this.peopleExtraImport = reservation.peopleExtraImport;
    this.hoursExtraImport = reservation.hoursExtraImport;
    this.brokenThingsImport = reservation.brokenThingsImport;
    this.notes = reservation.notes;
    this.status = reservation.status;
    this.reservationTypeId = 1;
  }
}

export class PersonalReservation {
  id?: number;
  startDate?: string | null;
  endDate?: string | null;
  total: number;
  totalPaid: number;
  customerId?: number;
  products?: any[];
  services?: any[];
  reservationTypeId: number;
  status?: string;
  facilitiesImport?: number;
  consumptionsImport?: number;
  peopleExtraImport?: number;
  hoursExtraImport?: number;
  brokenThingsImport?: number;
  notes?: string;
  constructor(reservation: IReservation) {
    this.id = reservation.id;
    this.startDate = reservation.startDate;
    this.endDate = reservation.endDate;
    this.total = reservation.total;
    this.totalPaid = reservation.totalPaid;
    this.customerId = reservation.customerId;
    this.products = reservation.products;
    this.services = reservation.services;
    this.facilitiesImport = reservation.facilitiesImport;
    this.consumptionsImport = reservation.consumptionsImport;
    this.peopleExtraImport = reservation.peopleExtraImport;
    this.hoursExtraImport = reservation.hoursExtraImport;
    this.brokenThingsImport = reservation.brokenThingsImport;
    this.notes = reservation.notes;
    this.status = reservation.status;
    this.reservationTypeId = 3;
  }
}

export interface CreatedReservation {
  message: string;
  reservationId: number;
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface ReservationListResponse {
  data: Reservation[];
  paginate: Paginate;
}
