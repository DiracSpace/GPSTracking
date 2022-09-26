import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserLocationsPageRoutingModule } from './locations-settings-routing.module';
import { LocationsSettingsPage } from './locations-settings.page';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserLocationsPageRoutingModule,
    CoreModule,
  ],
  declarations: [LocationsSettingsPage]
})
export class UserLocationsPageModule {}
