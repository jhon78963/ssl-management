import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { ReservationsService } from '../../../services/reservations.service';
import { FinishReservation } from '../../../models/reservation.model';
import { RoomsService } from '../../../../../room/rooms/services/rooms.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    InputNumberModule,
    FormsModule,
    InputGroupModule,
    ButtonModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  customers: any[] | undefined = [];
  products: any[] | undefined = [];
  services: any[] | undefined = [];
  totalProducts: number = 0;
  totalServices: number = 0;
  customerPrice: number = 0;
  customerAdditionalPrice: number = 0;
  customerAdditionalQuantity: number = 0;
  total: number = 0;

  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly reservationsService: ReservationsService,
    private readonly roomsService: RoomsService,
  ) {}
  ngOnInit(): void {
    const room = this.dynamicDialogConfig.data.room;
    this.reservationsService
      .getOne(room.reservationId)
      .subscribe((reservation: any) => {
        this.customers = reservation.customers;
        this.customerPrice = room.pricePerCapacity;
        this.customerAdditionalQuantity =
          reservation.customersNumber - room.capacity > 0
            ? reservation.customersNumber - room.capacity
            : 0;
        this.customerAdditionalPrice =
          this.customerAdditionalQuantity * room.pricePerAdditionalPerson;
        this.products = reservation.products;
        this.services = reservation.services;
        this.totalProducts = this.products
          ?.filter(product => product.price)
          .reduce((sum, product) => sum + product.price * product.quantity, 0);
        this.totalServices = this.services
          ?.filter(product => product.price)
          .reduce((sum, product) => sum + product.price * product.quantity, 0);
        this.total =
          this.totalProducts +
          this.totalServices +
          this.customerAdditionalPrice +
          this.customerPrice;
        this.products?.forEach(product => {
          product.total = (product.price ?? 0) * (product.quantity ?? 1);
        });
        this.services?.forEach(service => {
          service.total = (service.price ?? 0) * (service.quantity ?? 1);
        });
      });
  }

  payment(total: number) {
    const room = this.dynamicDialogConfig.data.room;
    const body = {
      id: room.reservationId,
      status: 'COMPLETED',
      total: total,
    };
    const reservation = new FinishReservation(body);
    this.reservationsService.edit(room.reservationId, reservation).subscribe({
      next: () => {
        const body = {
          id: room.id,
          status: 'AVAILABLE',
        };
        this.roomsService.changeStatus(room.id, body).subscribe();
        this.dynamicDialogRef.close({ success: true });
      },
    });
  }
}
