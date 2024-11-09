import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { debounceTime, Observable, Subject } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaginatorState } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';

// import { ChangeStatusComponent } from '../../components/change-status/change-status.component';
import { LoadingService } from '../../../../../services/loading.service';
// import { RoomsFormComponent } from '../form/rooms-form.component';
import { ReservationsService } from '../../services/reservations.service';
import { SharedModule } from '../../../../../shared/shared.module';

import {
  CallToAction,
  Column,
} from '../../../../../interfaces/table.interface';

import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ToastModule, SharedModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
  providers: [ConfirmationService, DialogService, MessageService],
})
export class ReservationComponent implements OnInit, OnDestroy {
  roomModal: DynamicDialogRef | undefined;
  columns: Column[] = [];
  cellToAction: any;
  data: any[] = [];
  limit: number = 10;
  page: number = 1;
  description: string = '';
  callToAction: CallToAction<Reservation>[] = [
    // {
    //   type: 'button',
    //   size: 'small',
    //   icon: 'pi pi-pencil',
    //   outlined: true,
    //   pTooltip: 'Editar',
    //   tooltipPosition: 'bottom',
    //   click: (rowData: Reservation) => this.reservationEditButton(rowData.id),
    // },
  ];

  private searchTermSubject = new Subject<string>();

  constructor(
    private readonly dialogService: DialogService,
    private readonly reservationsService: ReservationsService,
    public messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.columns = [
      { header: '#', field: 'id', clickable: false, image: false },
      {
        header: 'Fecha de reservación',
        field: 'reservationDate',
        clickable: false,
        image: false,
      },
      {
        header: 'Total',
        field: 'totalString',
        clickable: false,
        image: false,
      },
      {
        header: 'Estado',
        field: 'status',
        clickable: false,
        image: false,
      },
      // {
      //   field: 'button',
      //   header: 'Acción',
      //   clickable: false,
      //   image: false,
      // },
    ];

    this.getReservations(this.limit, this.page, this.description);
    this.searchTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.loadingService.sendLoadingState(true);
      this.getReservations(this.limit, this.page, this.description);
    });
  }

  ngOnDestroy(): void {
    if (this.roomModal) {
      this.roomModal.close();
    }
  }

  clearFilter(): void {
    this.description = '';
    this.onSearchTermChange('');
  }

  onSearchTermChange(term: any): void {
    this.searchTermSubject.next(term);
  }

  async getReservations(
    limit = this.limit,
    page = this.page,
    description = this.description,
  ): Promise<void> {
    this.updatePage(page);
    this.reservationsService.callGetList(limit, page, description).subscribe();
    setTimeout(() => {
      this.loadingService.sendLoadingState(false);
    }, 600);
  }

  get reservations(): Observable<Reservation[]> {
    return this.reservationsService.getList();
  }

  get total(): Observable<number> {
    return this.reservationsService.getTotal();
  }

  async onPageSelected(event: PaginatorState) {
    this.updatePage((event.page ?? 0) + 1);
    this.getReservations(event.rows, this.page);
  }

  // roomCreateButton(): void {
  //   this.roomModal = this.dialogService.open(RoomsFormComponent, {
  //     data: {},
  //     header: 'Crear',
  //   });

  //   this.roomModal.onClose.subscribe({
  //     next: value => {
  //       value && value?.success
  //         ? this.showSuccess('Habitación creada.')
  //         : value?.error
  //           ? this.showError(value?.error)
  //           : null;
  //     },
  //   });
  // }

  // reservationEditButton(id: number): void {
  //   this.roomModal = this.dialogService.open(RoomsFormComponent, {
  //     data: { id },
  //     header: 'Editar',
  //   });

  //   this.roomModal.onClose.subscribe({
  //     next: value => {
  //       value && value?.success
  //         ? this.showSuccess('Habitación actualizada.')
  //         : value?.error
  //           ? this.showError(value?.error)
  //           : null;
  //     },
  //   });
  // }

  // roomChangeStatusButton(id: number): void {
  //   this.roomModal = this.dialogService.open(ChangeStatusComponent, {
  //     data: { id },
  //     header: 'Cambiar estado',
  //   });

  //   this.roomModal.onClose.subscribe({
  //     next: value => {
  //       value && value?.success
  //         ? this.showSuccess('Habitación actualizada.')
  //         : value?.error
  //           ? this.showError(value?.error)
  //           : null;
  //     },
  //   });
  // }

  // addRoomImageButton(id: number, images: Image[]) {
  //   this.roomModal = this.dialogService.open(AddImagesComponent, {
  //     data: { id, images },
  //     header: 'Agregar imágenes',
  //   });

  //   this.roomModal.onClose.subscribe({
  //     next: value => {
  //       value && value?.success
  //         ? this.showSuccess('Imágen agregada.')
  //         : value?.error
  //           ? this.showError(value?.error)
  //           : null;
  //     },
  //   });
  // }

  // addRoomReviewButton(id: number, reviews: Review[]) {
  //   this.roomModal = this.dialogService.open(AddReviewsComponent, {
  //     data: { id, reviews },
  //     header: 'Reseñas',
  //   });

  //   this.roomModal.onClose.subscribe({
  //     next: value => {
  //       value && value?.success
  //         ? this.showSuccess('Comodidad agregada.')
  //         : value?.error
  //           ? this.showError(value?.error)
  //           : null;
  //     },
  //   });
  // }

  // roomDeleteButton(id: number, event: Event) {
  //   this.confirmationService.confirm({
  //     target: event.target as EventTarget,
  //     message: 'Deseas eliminar esta reseña?',
  //     header: 'Eliminar reseña',
  //     icon: 'pi pi-info-circle',
  //     acceptButtonStyleClass: 'p-button-danger p-button-text',
  //     rejectButtonStyleClass: 'p-button-text p-button-text',
  //     acceptIcon: 'none',
  //     rejectIcon: 'none',

  //     accept: () => {
  //       this.reservationsService.delete(id).subscribe(() => {
  //         this.showSuccess('La habitación ha sido eliminado');
  //       });
  //     },
  //     reject: () => {
  //       this.showError('No se eleminó la habitación, intenteló nuevamente');
  //     },
  //   });
  // }

  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Confirmado',
      detail: message,
      life: 3000,
    });
  }

  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });
  }

  private updatePage(value: number): void {
    this.page = value;
  }
}
