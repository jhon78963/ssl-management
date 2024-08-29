import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialNetworkRoutingModule } from './social-network-routing.module';
import { SocialNetworkListComponent } from './pages/list/social-network.component';
import { SocialNetworkFormComponent } from './pages/form/social-network-form.component';

@NgModule({
  declarations: [SocialNetworkListComponent, SocialNetworkFormComponent],
  imports: [CommonModule, SocialNetworkRoutingModule],
})
export class SocialNetworkModule {}
