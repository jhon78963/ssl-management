export interface IBooking {
  id?: number;
  startDate?: string | null;
  total: number;
  totalPaid: number;
  customerId: number;
  facilitiesImport: number;
  peopleExtraImport: number;
  consumptionsImport: number;
  title: string;
  description: string;
  location: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  products?: any[];
  services?: any[];
  notes?: string;
}

export class Booking {
  id?: number;
  startDate?: string | null;
  total: number;
  totalPaid: number;
  customerId: number;
  facilitiesImport: number;
  peopleExtraImport: number;
  consumptionsImport: number;
  title: string;
  description: string;
  location: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  products?: any[];
  services?: any[];
  notes?: string;
  constructor(booking: IBooking) {
    this.startDate = booking.startDate;
    this.total = booking.total;
    this.totalPaid = booking.totalPaid;
    this.customerId = booking.customerId;
    this.facilitiesImport = booking.facilitiesImport;
    this.peopleExtraImport = booking.peopleExtraImport;
    this.consumptionsImport = booking.consumptionsImport;
    this.title = booking.title;
    this.description = booking.description;
    this.location = booking.location;
    this.backgroundColor = '#ffb340';
    this.borderColor = '#ffb340';
    this.textColor = '#000000';
    this.products = booking.products;
    this.services = booking.services;
    this.notes = booking.notes;
  }
}

export interface CreatedBooking {
  message: string;
  bookingId: number;
}
