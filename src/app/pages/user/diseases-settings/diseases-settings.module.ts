import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiseasesSettingsPageRoutingModule } from './diseases-settings-routing.module';

import { DiseasesSettingsPage } from './diseases-settings.page';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DiseasesSettingsPageRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule
    ],
    declarations: [DiseasesSettingsPage]
})
export class DiseasesSettingsPageModule {}
