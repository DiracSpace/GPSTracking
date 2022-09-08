import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserLocationsPageRoutingModule } from './user-locations-routing.module';

import { UserLocationsPage } from './user-locations.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserLocationsPageRoutingModule
  ],
  declarations: [UserLocationsPage]
})
export class UserLocationsPageModule {}
