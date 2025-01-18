import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoomsService } from '../../../facility/room/rooms/services/rooms.service';
import { FacilitiesService } from '../../services/facilities.service';
import { CRoom } from '../../../facility/room/rooms/models/rooms.model';
import { Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-change-rooms',
  standalone: true,
  imports: [ButtonModule, CommonModule, ConfirmDialogModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class ChangeRoomsComponent implements OnInit {
  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly confirmationService: ConfirmationService,
    private readonly roomsService: RoomsService,
    private readonly facilitiesService: FacilitiesService,
  ) {}

  ngOnInit(): void {
    this.getRooms();
  }

  getRooms() {
    this.roomsService.getRoomsAvailable().subscribe();
  }

  get rooms(): Observable<CRoom[]> {
    return this.roomsService.getAvailableList();
  }

  changeRoom(newRoom: CRoom) {
    const reservationId = this.dynamicDialogConfig.data.reservationId;
    const roomId = this.dynamicDialogConfig.data.roomId;

    this.confirmationService.confirm({
      message: `Deseas cambiar a la habitación N° ${newRoom.number}?`,
      header: `Cambiar habitación N° L${roomId}`,
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        if (newRoom && newRoom.id) {
          this.roomsService
            .change(reservationId, roomId, newRoom.id)
            .subscribe({
              next: () => {
                this.getRooms();
                if (newRoom && newRoom.id) {
                  this.updateRoom(roomId, 'AVAILABLE');
                  this.updateRoom(newRoom.id, 'IN_USE');
                  this.dynamicDialogRef.close({
                    success: true,
                    oldRoomId: roomId,
                    newRoom: newRoom,
                  });
                }
              },
            });
        }
      },
      reject: () => {},
    });
  }

  updateRoom(roomId: number, status: string): void {
    const body: any = {
      id: roomId,
      status,
    };
    if (roomId) {
      this.facilitiesService.changeRoomStatus(roomId, body).subscribe();
    }
  }
}
