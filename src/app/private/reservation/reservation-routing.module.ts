import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationListComponent } from './pages/list/reservation.component';

const routes: Routes = [
  { path: '', component: ReservationListComponent },
  { path: '', pathMatch: 'full', redirectTo: 'reservations' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservationRoutingModule {}
