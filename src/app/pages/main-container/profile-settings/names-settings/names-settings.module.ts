import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NamesSettingsPageRoutingModule } from './names-settings-routing.module';

import { NamesSettingsPage } from './names-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NamesSettingsPageRoutingModule
  ],
  declarations: [NamesSettingsPage]
})
export class NamesSettingsPageModule {}
