import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileSettingsPage } from './profile-settings.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileSettingsPage
  },
  {
    path: 'names-settings',
    loadChildren: () => import('./names-settings/names-settings.module').then( m => m.NamesSettingsPageModule)
  },
  {
    path: 'phonen-umbers-settings',
    loadChildren: () => import('./phone-numbers-settings/phone-numbers-settings.module').then( m => m.PhonenUmbersSettingsPageModule)
  },
  {
    path: 'diseases-settings',
    loadChildren: () => import('./diseases-settings/diseases-settings.module').then( m => m.DiseasesSettingsPageModule)
  },
  {
    path: 'alergies-settings',
    loadChildren: () => import('./alergies-settings/alergies-settings.module').then( m => m.AlergiesSettingsPageModule)
  },
  {
    path: 'addresses-settings',
    loadChildren: () => import('./addresses-settings/addresses-settings.module').then( m => m.AddressesSettingsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileSettingsPageRoutingModule {}
