import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocialNetworkFormComponent } from './pages/form/social-network-form.component';

const routes: Routes = [
  { path: '', component: SocialNetworkFormComponent },
  { path: '', pathMatch: 'full', redirectTo: 'social-network' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SocialNetworkRoutingModule {}
