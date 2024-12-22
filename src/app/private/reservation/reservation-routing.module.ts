import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationBookComponent } from './pages/book/reservation.component';

const routes: Routes = [
  { path: '', component: ReservationBookComponent },
  { path: '', pathMatch: 'full', redirectTo: 'reservations' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservationRoutingModule {}
