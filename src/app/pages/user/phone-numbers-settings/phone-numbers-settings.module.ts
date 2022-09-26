import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhonenUmbersSettingsPageRoutingModule } from './phone-numbers-settings-routing.module';

import { PhoneNumbersSettingsPage } from './phone-numbers-settings.page';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhonenUmbersSettingsPageRoutingModule,
    FormsModule,
    CoreModule
  ],
  declarations: [PhoneNumbersSettingsPage]
})
export class PhonenUmbersSettingsPageModule {}
