import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhonenUmbersSettingsPageRoutingModule } from './phone-numbers-settings-routing.module';

import { PhoneNumbersSettingsPage } from './phone-numbers-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhonenUmbersSettingsPageRoutingModule
  ],
  declarations: [PhoneNumbersSettingsPage]
})
export class PhonenUmbersSettingsPageModule {}
