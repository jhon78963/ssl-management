import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyListComponent } from './pages/list/company.component';
import { CompanyFormComponent } from './pages/form/company-form.component';

@NgModule({
  declarations: [CompanyListComponent, CompanyFormComponent],
  imports: [CommonModule, CompanyRoutingModule],
})
export class CompanyModule {}
