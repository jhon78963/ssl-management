import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyListComponent } from './pages/list/company.component';

const routes: Routes = [
  { path: '', component: CompanyListComponent },
  { path: '', pathMatch: 'full', redirectTo: 'company' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRoutingModule {}
