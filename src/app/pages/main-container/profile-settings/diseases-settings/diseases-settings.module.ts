import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiseasesSettingsPageRoutingModule } from './diseases-settings-routing.module';

import { DiseasesSettingsPage } from './diseases-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiseasesSettingsPageRoutingModule
  ],
  declarations: [DiseasesSettingsPage]
})
export class DiseasesSettingsPageModule {}
