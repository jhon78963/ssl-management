import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PickListModule } from 'primeng/picklist';
import { ReservationServicesService } from '../../services/reservation-services.service';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-add-services',
  standalone: true,
  imports: [TableModule, ToastModule, PickListModule],
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
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly reservationServicesService: ReservationServicesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // const id = this.dynamicDialogConfig.data.id;
    this.updateServices(this.reservationId);
  }

  updateServices(id: number): void {
    this.reservationServicesService.findLeft(id).subscribe({
      next: (response: Service[]) => {
        this.sourceServices = response;
        this.cdr.markForCheck();
      },
      error: () => {},
    });

    this.reservationServicesService.findAll(id).subscribe({
      next: (response: any) => {
        this.targetServices = response;
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  addService(event: any): void {
    // const reservationId = this.dynamicDialogConfig.data.id;
    const services = event.items;
    services.map((service: any) => {
      this.reservationServicesService
        .add(this.reservationId, service.id)
        .subscribe({
          next: () => {},
          error: () => {},
        });
    });
    this.updateServices(this.reservationId);
  }

  removeService(event: any): void {
    // const reservationId = this.dynamicDialogConfig.data.id;
    const services = event.items;
    services.map((service: any) => {
      this.reservationServicesService
        .remove(this.reservationId, service.id)
        .subscribe({
          next: () => {},
          error: () => {},
        });
    });
    this.updateServices(this.reservationId);
  }
}
