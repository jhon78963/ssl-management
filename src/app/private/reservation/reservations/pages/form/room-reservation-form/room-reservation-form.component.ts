import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { debounceTime, Observable, Subject } from 'rxjs';
import { RoomsService } from '../../../../../room/rooms/services/rooms.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Room } from '../../../../../room/rooms/models/rooms.model';
import { InUseRoomsService } from '../../../../../room/rooms/services/in-use-rooms.service';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';

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
  private searchInUseTermSubject = new Subject<string>();

  selectedReservations: any[] = [];

  constructor(
    private readonly dialogService: DialogService,
    public messageService: MessageService,
    private readonly roomsService: RoomsService,
    private readonly inUseRoomsService: InUseRoomsService,
  ) {}

  ngOnInit(): void {
    this.getAvailableRooms(this.limit, this.page, this.number, this.status);
    this.searchAvailableTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getAvailableRooms(this.limit, this.page, this.number, this.status);
    });
    this.searchInUseTermSubject.pipe(debounceTime(600)).subscribe(() => {
      this.getInUseRooms(
        this.inUseLimit,
        this.inUsePage,
        this.inUseNumber,
        this.inUseStatus,
      );
    });
  }

  statusChange(event: any) {
    if (event.value?.value == 1) {
      this.first = (this.page - 1) * this.limit;
      this.status = 'AVAILABLE';
      this.statusSelected = this.statusOptions[0];
      this.getAvailableRooms(this.limit, this.page, this.number, this.status);
    } else {
      this.first = (this.page - 1) * this.limit;
      this.status = 'IN_USE';
      this.statusSelected = this.statusOptions[1];
      this.getInUseRooms(
        this.inUseLimit,
        this.inUsePage,
        this.inUseNumber,
        this.inUseStatus,
      );
    }
  }

  massiveReservation(selectedReservation: any[]) {
    console.log(selectedReservation);
  }

  reservation(room: Room) {
    console.log(room);
  }

  show(room: Room) {
    console.log(room);
  }

  finish(room: Room) {
    console.log(room);
  }

  async getAvailableRooms(
    limit = this.limit,
    page = this.page,
    number = this.number,
    status = this.status,
  ): Promise<void> {
    this.roomsService.callGetList(limit, page, number, status).subscribe();
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
    this.getAvailableRooms(this.limit, this.page, this.number, this.status);
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

  async getInUseRooms(
    limit = this.inUseLimit,
    page = this.inUsePage,
    number = this.inUseNumber,
    status = this.inUseStatus,
  ): Promise<void> {
    this.inUseRoomsService.callGetList(limit, page, number, status).subscribe();
  }

  get inUseRooms(): Observable<Room[]> {
    return this.roomsService.getList();
  }

  get inUseRoomTotal(): Observable<number> {
    return this.roomsService.getTotal();
  }

  onInUseRoomPageChange(event: any) {
    this.page = event.page + 1;
    this.first = event.first;
    this.getInUseRooms(this.limit, this.page, this.number, this.status);
  }

  onInUseRoomFilter(term: any) {
    const input = term.target.value;
    if (input == '') {
      this.searchInUseTermSubject.next('');
    }
    const sanitizedInput = input.replace(/\D/g, '');
    term.target.value = sanitizedInput;
    if (sanitizedInput) {
      this.searchInUseTermSubject.next(sanitizedInput);
    }
  }
}
