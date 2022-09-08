import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserLocationsPage } from './user-locations.page';

const routes: Routes = [
  {
    path: '',
    component: UserLocationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserLocationsPageRoutingModule {}
