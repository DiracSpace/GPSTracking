import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlergiesSettingsPageRoutingModule } from './alergies-settings-routing.module';

import { AlergiesSettingsPage } from './alergies-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlergiesSettingsPageRoutingModule
  ],
  declarations: [AlergiesSettingsPage]
})
export class AlergiesSettingsPageModule {}
