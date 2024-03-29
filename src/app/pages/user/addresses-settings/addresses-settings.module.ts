import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddressesSettingsPageRoutingModule } from './addresses-settings-routing.module';

import { AddressesSettingsPage } from './addresses-settings.page';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddressesSettingsPageRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule
    ],
    declarations: [AddressesSettingsPage]
})
export class AddressesSettingsPageModule {}
