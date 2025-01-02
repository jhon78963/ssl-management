import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FacilitiesService } from '../../services/facilities.service';
import { PaymentType } from '../../models/payment-type.model';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { Customer } from '../../models/customer.model';
import { FacilityType } from '../../models/facility.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonModule,
    FormsModule,
    InputNumberModule,
    CalendarModule,
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
  providers: [DatePipe],
})
export class BookingComponent implements OnInit {
  facilities: any[] = [];
  customer: any;
  notes: any;
  startDate: Date = new Date();
  payments: PaymentType[] = [
    { id: 1, description: 'Efectivo' },
    { id: 2, description: 'Tarjeta' },
    { id: 3, description: 'Mixto' },
  ];
  selectedPaymentType: any = this.payments[0];
  lockerPrice: number = 0;
  total: number = 0;
  paid: number = 0;
  cash: number = 0;
  card: number = 0;
  advance: number = 0;
  pending: number = 0;

  constructor(
    private readonly datePipe: DatePipe,
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly facilitiesService: FacilitiesService,
  ) {}

  getCustomer() {
    this.customer = this.dynamicDialogConfig.data.customer;
  }

  getFacilities() {
    this.facilities = this.dynamicDialogConfig.data.facilities;
    this.lockerPrice = this.facilities
      ?.filter(facility => facility.price)
      .reduce((sum, facility) => sum + facility.price, 0);
  }

  getNotes() {
    this.notes = this.dynamicDialogConfig.data.notes;
  }

  getTotal() {
    this.total = this.lockerPrice;
  }

  ngOnInit(): void {
    this.getCustomer();
    this.getFacilities();
    this.getNotes();
    this.getTotal();
  }

  calculateTotalCash(cash: any) {
    this.card = this.paid - cash;
  }

  calculateTotalCard(card: any) {
    this.cash = this.paid - card;
  }

  validateFacilities(facilities: any[]) {
    return {
      rooms: facilities.filter(f => f.type == FacilityType.ROOM),
    };
  }

  getDate(date: Date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  }

  book() {
    const newFacilities = this.validateFacilities(this.facilities);
    if (newFacilities.rooms.length > 0) {
      this.createRoomBooking(
        this.customer,
        newFacilities.rooms,
        this.total,
        this.getDate(this.startDate),
      );
    }
  }

  createRoomBooking(
    customer: Customer | null | undefined,
    facilities: any[],
    total: number,
    startDate: string | null,
  ) {
    console.log(customer, facilities, total, startDate);
  }
}
