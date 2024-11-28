import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { PickListModule } from 'primeng/picklist';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Service } from '../../models/service.model';
import { ReservationServicesService } from '../../services/reservation-services.service';

@Component({
  selector: 'app-add-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    PickListModule,
    TableModule,
    ToastModule,
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesAddComponent implements OnInit {
  @Input() reservationId: number = 0;
  leftServices: Service[] = [];
  selectedServices: Service | undefined;
  sourceServices: Service[] | undefined;
  targetServices: Service[] | undefined;

  constructor(
    private readonly reservationServicesService: ReservationServicesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.updateServices(this.reservationId);
  }

  updateServices(id: number): void {
    this.reservationServicesService.findLeft(id).subscribe({
      next: (response: Service[]) => {
        this.sourceServices = response;
        this.sourceServices.map((sourceService: Service) => {
          sourceService.quantity = sourceService.quantity ?? 1;
        });
        this.cdr.markForCheck();
      },
      error: () => {},
    });

    this.reservationServicesService.findAll(id).subscribe({
      next: (response: Service[]) => {
        this.targetServices = response;
        this.targetServices.map((targetService: Service) => {
          targetService.quantity = targetService.quantity ?? 1;
        });
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  addService(event: any): void {
    const services = event.items;
    services.map((service: any) => {
      this.reservationServicesService
        .add(this.reservationId, service.id, service.quantity)
        .subscribe({
          next: () => {},
          error: () => {},
        });
    });
  }

  removeService(event: any): void {
    const services = event.items;
    services.map((service: any) => {
      this.reservationServicesService
        .remove(this.reservationId, service.id, service.quantity)
        .subscribe({
          next: () => {},
          error: () => {},
        });
    });
  }
}
