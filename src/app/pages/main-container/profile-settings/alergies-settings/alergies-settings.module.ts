import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlergiesSettingsPageRoutingModule } from './alergies-settings-routing.module';

import { AlergiesSettingsPage } from './alergies-settings.page';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AlergiesSettingsPageRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule
    ],
    declarations: [AlergiesSettingsPage]
})
export class AlergiesSettingsPageModule {}
