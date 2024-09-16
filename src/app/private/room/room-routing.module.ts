import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomLayoutComponent } from './layout/room.layout.component';

const routes: Routes = [
  {
    path: '',
    component: RoomLayoutComponent,

    children: [
      {
        path: 'rooms',
        loadComponent: () =>
          import('./rooms/pages/list/rooms.component').then(
            c => c.RoomsComponent,
          ),
      },
      {
        path: 'amenities',
        loadComponent: () =>
          import('./amenities/pages/list/amenities.component').then(
            c => c.AmenitiesComponent,
          ),
      },
      {
        path: 'rates',
        loadComponent: () =>
          import('./rates/pages/list/rates.component').then(
            c => c.RatesComponent,
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./reviews/pages/list/reviews.component').then(
            c => c.ReviewsComponent,
          ),
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
export class RoomRoutingModule {}
