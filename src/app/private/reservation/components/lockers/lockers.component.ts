import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { Locker } from '../../../facility/locker/models/locker.model';
import { LockersService } from '../../../facility/locker/services/lockers.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FacilitiesService } from '../../services/facilities.service';

@Component({
  selector: 'app-change-lockers',
  standalone: true,
  imports: [ButtonModule, CommonModule, ConfirmDialogModule],
  templateUrl: './lockers.component.html',
  styleUrl: './lockers.component.scss',
})
export class ChangeLockersComponent implements OnInit {
  constructor(
    private readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly confirmationService: ConfirmationService,
    private readonly lockersService: LockersService,
    private readonly facilitiesService: FacilitiesService,
  ) {}

  ngOnInit(): void {
    this.getLockers();
  }

  getLockers() {
    this.lockersService.getLockersAvailable().subscribe();
  }

  get lockers(): Observable<Locker[]> {
    return this.lockersService.getAvailableList();
  }

  changeLocker(newLocker: Locker) {
    const reservationId = this.dynamicDialogConfig.data.reservationId;
    const lockerId = this.dynamicDialogConfig.data.lockerId;

    this.confirmationService.confirm({
      message: `Deseas cambiar al locker N° ${newLocker.number}?`,
      header: `Cambiar locker N° L${lockerId}`,
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        if (newLocker && newLocker.id) {
          this.lockersService
            .change(reservationId, lockerId, newLocker.id)
            .subscribe({
              next: () => {
                this.getLockers();
                if (newLocker && newLocker.id) {
                  this.updateLocker(lockerId, 'AVAILABLE');
                  this.updateLocker(newLocker.id, 'IN_USE');
                  this.dynamicDialogRef.close({
                    success: true,
                    oldLockerId: lockerId,
                    newLocker: newLocker,
                  });
                }
              },
            });
        }
      },
      reject: () => {},
    });
  }

  updateLocker(lockerId: number, status: string): void {
    const body: any = {
      id: lockerId,
      status,
    };
    if (lockerId) {
      this.facilitiesService.changeLockerStatus(lockerId, body).subscribe();
    }
  }
}
