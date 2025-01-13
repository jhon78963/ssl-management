import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    title: 'Home',
    data: { breadcrumb: 'Home' },
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'profile',
    title: 'Profile',
    data: { breadcrumb: 'Profile' },
    loadChildren: () =>
      import('./profile/profile.module').then(m => m.ProfileModule),
  },
  {
    path: 'administration',
    title: 'Administración',
    data: { breadcrumb: 'Administración' },
    loadChildren: () =>
      import('./administration/administration.module').then(
        m => m.AdministrationModule,
      ),
  },
  {
    path: 'management',
    title: 'Gestión',
    data: { breadcrumb: 'Gestión' },
    loadChildren: () =>
      import('./management/management.module').then(m => m.ManagementModule),
  },
  {
    path: 'room',
    title: 'Habitaciones',
    data: { breadcrumb: 'Habitaciones' },
    loadChildren: () => import('./room/room.module').then(m => m.RoomModule),
  },
  {
    path: 'reservation',
    title: 'Reservaciones',
    data: { breadcrumb: 'Reservaciones' },
    loadChildren: () =>
      import('./reservation/reservation.module').then(m => m.ReservationModule),
  },
  {
    path: 'cash',
    title: 'Caja',
    data: { breadcrumb: 'Caja' },
    loadChildren: () => import('./cash/cash.module').then(m => m.CashModule),
  },
  {
    path: 'locker',
    title: 'Locker',
    data: { breadcrumb: 'Locker' },
    loadChildren: () =>
      import('./locker/locker.module').then(m => m.LockerModule),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
    data: { breadcrumb: 'Home' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateRoutingModule {}
