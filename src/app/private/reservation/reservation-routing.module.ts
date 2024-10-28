import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationLayoutComponent } from './layout/reservation.layout.component';
import { ReservationFormLayoutComponent } from './reservations/pages/form/layout/reservation-form.layout.component';

const routes: Routes = [
  {
    path: '',
    component: ReservationLayoutComponent,
    children: [
      {
        path: 'reservations',
        loadComponent: () =>
          import('./reservations/pages/list/reservation.component').then(
            c => c.ReservationComponent,
          ),
      },
      {
        path: 'books',
        component: ReservationFormLayoutComponent,
        children: [
          {
            path: 'general',
            loadComponent: () =>
              import(
                './reservations/pages/form/customer-reservation-form/customer-reservation-form.component'
              ).then(c => c.CustomerReservationFormComponent),
          },
          {
            path: 'private',
            loadComponent: () =>
              import(
                './reservations/pages/form/room-reservation-form/room-reservation-form.component'
              ).then(c => c.RoomReservationFormComponent),
          },
          {
            path: '',
            redirectTo: 'general',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        redirectTo: 'rooms',
        pathMatch: 'full',
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'rooms' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservationRoutingModule {}
