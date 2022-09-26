import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NamesSettingsPage } from './names-settings.page';

const routes: Routes = [
  {
    path: '',
    component: NamesSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NamesSettingsPageRoutingModule {}
