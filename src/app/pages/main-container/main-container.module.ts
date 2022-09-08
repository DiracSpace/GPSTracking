import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainContainerPageRoutingModule } from './main-container-routing.module';

import { MainContainerPage } from './main-container.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MainContainerPageRoutingModule
    ],
    declarations: [MainContainerPage]
})
export class MainContainerPageModule {}
