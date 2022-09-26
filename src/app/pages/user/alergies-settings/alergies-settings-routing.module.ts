import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlergiesSettingsPage } from './alergies-settings.page';

const routes: Routes = [
  {
    path: '',
    component: AlergiesSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlergiesSettingsPageRoutingModule {}
