import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddressesSettingsPage } from './addresses-settings.page';

const routes: Routes = [
  {
    path: '',
    component: AddressesSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressesSettingsPageRoutingModule {}
