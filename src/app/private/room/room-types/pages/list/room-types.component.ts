import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { debounceTime, Observable, Subject } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaginatorState } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';

import { LoadingService } from '../../../../../services/loading.service';
import { RoomTypesFormComponent } from '../form/room-types-form.component';
import { RoomTypesService } from '../../services/room-types.service';
import { SharedModule } from '../../../../../shared/shared.module';

import {
  CallToAction,
  Column,
} from '../../../../../interfaces/table.interface';
import { RoomType } from '../../models/room-types.model';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ToastModule, SharedModule],
  templateUrl: './room-types.component.html',
  styleUrl: './room-types.component.scss',
  providers: [ConfirmationService, DialogService, MessageService],
})
export class RoomTypesComponent implements OnInit, OnDestroy {
  roomTypeModal: DynamicDialogRef | undefined;
  columns: Column[] = [];
  cellToAction: any;
  data: any[] = [];
  limit: number = 10;
  page: number = 1;
  description: string = '';
  callToAction: CallToAction<RoomType>[] = [
    {
      type: 'button',
      size: 'small',
      icon: 'pi pi-pencil',
      outlined: true,
      pTooltip: 'Editar',
      tooltipPosition: 'bottom',
      click: (rowData: RoomType) => this.roomTypeEditButton(rowData.id),
    },
    {
      type: 'button',
      size: 'small',
      icon: 'pi pi-trash',
      outlined: true,
      pTooltip: 'Eliminar',
      tooltipPosition: 'bottom',
      click: (rowData: RoomType, event?: Event) =>
        this.roomTypeDeleteButton(rowData.id, event!),
    },
  ];

  private searchTermSubject = new Subject<string>();

  constructor(
    private readonly dialogService: DialogService,
    private readonly roomTypesService: RoomTypesService,
    public messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.columns = [
      { header: '#', field: 'id', clickable: false },
      {
        header: 'Tipo de Habitación',
        field: 'description',
        clickable: false,
      },
      {
        field: 'button',
        header: 'Acción',
        clickable: false,
      },
    ];

    this.getRoomTypes(this.limit, this.page, this.description);
    this.searchTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.loadingService.sendLoadingState(true);
      this.getRoomTypes(this.limit, this.page, this.description);
    });
  }

  ngOnDestroy(): void {
    if (this.roomTypeModal) {
      this.roomTypeModal.close();
    }
  }

  clearFilter(): void {
    this.description = '';
    this.onSearchTermChange('');
  }

  onSearchTermChange(term: any): void {
    this.searchTermSubject.next(term);
  }

  async getRoomTypes(
    limit = this.limit,
    page = this.page,
    description = this.description,
  ): Promise<void> {
    this.updatePage(page);
    this.roomTypesService.callGetList(limit, page, description).subscribe();
    setTimeout(() => {
      this.loadingService.sendLoadingState(false);
    }, 600);
  }

  get roomTypes(): Observable<RoomType[]> {
    return this.roomTypesService.getList();
  }

  get total(): Observable<number> {
    return this.roomTypesService.getTotal();
  }

  async onPageSelected(event: PaginatorState) {
    this.updatePage((event.page ?? 0) + 1);
    this.getRoomTypes(event.rows, this.page);
  }

  roomTypeCreateButton(): void {
    this.roomTypeModal = this.dialogService.open(RoomTypesFormComponent, {
      data: {},
      header: 'Crear',
    });

    this.roomTypeModal.onClose.subscribe({
      next: value => {
        value && value?.success
          ? this.showSuccess('Tipo de habitación creado.')
          : value?.error
            ? this.showError(value?.error)
            : null;
      },
    });
  }

  roomTypeEditButton(id: number): void {
    this.roomTypeModal = this.dialogService.open(RoomTypesFormComponent, {
      data: {
        id,
      },
      header: 'Editar',
    });

    this.roomTypeModal.onClose.subscribe({
      next: value => {
        value && value?.success
          ? this.showSuccess('Tipo de habitación actualizado.')
          : value?.error
            ? this.showError(value?.error)
            : null;
      },
    });
  }

  roomTypeDeleteButton(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseas eliminar este tipo de habitación?',
      header: 'Eliminar tipo de habitación',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.roomTypesService.delete(id).subscribe(() => {
          this.showSuccess('El tipo de habitación ha sido eliminado');
        });
      },
      reject: () => {
        this.showError(
          'No se eleminó el tipo de habitación, intenteló nuevamente',
        );
      },
    });
  }

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