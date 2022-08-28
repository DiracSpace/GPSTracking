import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserPageRoutingModule } from './user-routing.module';

import { UserPage } from './user.page';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, UserPageRoutingModule, CoreModule],
    declarations: [UserPage]
})
export class UserPageModule {}
