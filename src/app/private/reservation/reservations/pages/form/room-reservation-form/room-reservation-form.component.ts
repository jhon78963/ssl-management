import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectButtonModule } from 'primeng/selectbutton';
import { debounceTime, Observable, Subject } from 'rxjs';
import { Room } from '../../../../../room/rooms/models/rooms.model';
import { RoomsService } from '../../../../../room/rooms/services/rooms.service';
import { CheckoutComponent } from '../../../components/rooms/checkout/checkout.component';
import { RoomReservationComponent } from '../../../components/rooms/reservation/reservation.component';

@Component({
  selector: 'app-room-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectButtonModule,
    InputTextModule,
    PaginatorModule,
    CheckboxModule,
  ],
  templateUrl: './room-reservation-form.component.html',
  styleUrl: './room-reservation-form.component.scss',
  providers: [MessageService],
})
export class RoomReservationFormComponent implements OnInit {
  modal: DynamicDialogRef | undefined;

  statusOptions = [
    { name: 'Disponible', value: 1 },
    { name: 'En uso', value: 2 },
  ];

  statusSelected: any = this.statusOptions[0];

  rowsPerPageOptions: number[] = [12, 24, 50];

  first: number = 0;
  limit: number = 12;
  page: number = 1;
  number: string = '';
  status: string = 'AVAILABLE';

  inUseFirst: number = 0;
  inUseLimit: number = 12;
  inUsePage: number = 1;
  inUseNumber: string = '';
  inUseStatus: string = 'IN_USE';

  private searchAvailableTermSubject = new Subject<string>();

  selectedReservations: any[] = [];

  constructor(
    private readonly dialogService: DialogService,
    public messageService: MessageService,
    private readonly roomsService: RoomsService,
  ) {}

  ngOnInit(): void {
    this.getAvailableRooms(this.limit, this.page, this.number);
    this.searchAvailableTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getAvailableRooms(this.limit, this.page, this.number);
    });
  }

  reservation(room: Room) {
    this.modal = this.dialogService.open(RoomReservationComponent, {
      data: {
        room,
        create: true,
      },
      header: `Registrar ${room.roomName}`,
    });
  }

  show(room: Room) {
    this.modal = this.dialogService.open(RoomReservationComponent, {
      data: { room },
      header: `Agregar servicios ${room.roomName}`,
    });
  }

  finish(room: Room) {
    this.modal = this.dialogService.open(CheckoutComponent, {
      data: { room },
      header: `Checkout ${room.roomName}`,
    });
  }

  async getAvailableRooms(
    limit = this.limit,
    page = this.page,
    number = this.number,
  ): Promise<void> {
    this.roomsService.callGetList(limit, page, number).subscribe();
  }

  get availableRooms(): Observable<Room[]> {
    return this.roomsService.getList();
  }

  get availableRoomTotal(): Observable<number> {
    return this.roomsService.getTotal();
  }

  onAvailableRoomPageChange(event: any) {
    this.page = event.page + 1;
    this.first = event.first;
    this.getAvailableRooms(this.limit, this.page, this.number);
  }

  onAvailableRoomFilter(term: any) {
    const input = term.target.value;
    if (input == '') {
      this.searchAvailableTermSubject.next('');
    }
    const sanitizedInput = input.replace(/\D/g, '');
    term.target.value = sanitizedInput;
    if (sanitizedInput) {
      this.searchAvailableTermSubject.next(sanitizedInput);
    }
  }
}
