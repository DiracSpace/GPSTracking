import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationsSettingsPage } from './locations-settings.page';

const routes: Routes = [
  {
    path: '',
    component: LocationsSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserLocationsPageRoutingModule {}
