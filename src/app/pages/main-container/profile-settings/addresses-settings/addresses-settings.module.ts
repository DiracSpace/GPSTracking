import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddressesSettingsPageRoutingModule } from './addresses-settings-routing.module';

import { AddressesSettingsPage } from './addresses-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddressesSettingsPageRoutingModule
  ],
  declarations: [AddressesSettingsPage]
})
export class AddressesSettingsPageModule {}
