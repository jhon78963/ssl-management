import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReservationsService } from '../../services/reservations.service';
import { FinishReservation } from '../../models/reservation.model';
import { StatusLocker } from '../../models/locker.model';
import { FemaleLockersService } from '../../services/female-lockers.service';
import { MaleLockersService } from '../../services/male-lockers.service';

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
  quantities: number[] = [1, 1, 1];
  value: string = '';
  customer: string = '';
  products: any[] | undefined = [];
  services: any[] | undefined = [];
  totalProducts: number = 0;
  totalServices: number = 0;
  lockerPrice: number = 0;
  total: number = 0;
  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly femaleLockersService: FemaleLockersService,
    private readonly maleLockersService: MaleLockersService,
    private readonly reservationsService: ReservationsService,
  ) {}

  ngOnInit(): void {
    const locker = this.dynamicDialogConfig.data.locker;
    this.lockerPrice = locker.price;
    this.customer = `${locker.customerName} ${locker.customerSurname} - ${locker.customerDni}`;

    this.reservationsService
      .getOne(locker.reservationId)
      .subscribe(reservation => {
        this.products = reservation.products;
        this.services = reservation.services;
        this.totalProducts = this.products
          ?.filter(product => product.price)
          .reduce((sum, product) => sum + product.price, 0);
        this.totalServices = this.services
          ?.filter(product => product.price)
          .reduce((sum, product) => sum + product.price, 0);
        this.total = this.totalProducts + this.totalServices + this.lockerPrice;
      });
  }

  payment(total: number) {
    const locker = this.dynamicDialogConfig.data.locker;
    const body = {
      id: locker.reservationId,
      status: 'COMPLETED',
      total: total,
    };
    const reservation = new FinishReservation(body);
    this.reservationsService.edit(locker.reservationId, reservation).subscribe({
      next: () => {
        const body = {
          id: locker.id,
          status: 'AVAILABLE',
        };
        if (locker.genderId == 1) {
          const locker = new StatusLocker(body);
          this.maleLockersService.changeStatus(locker.id, body).subscribe();
        } else {
          const locker = new StatusLocker(body);
          this.femaleLockersService.changeStatus(locker.id, body).subscribe();
        }
        this.dynamicDialogRef.close({ success: true });
      },
    });
  }
}
