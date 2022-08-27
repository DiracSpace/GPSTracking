import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NamesSettingsPageRoutingModule } from './names-settings-routing.module';

import { NamesSettingsPage } from './names-settings.page';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        NamesSettingsPageRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule
    ],
    declarations: [NamesSettingsPage]
})
export class NamesSettingsPageModule {}
