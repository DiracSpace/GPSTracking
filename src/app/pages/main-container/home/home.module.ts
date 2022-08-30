import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { CoreModule } from 'src/app/core/core.module';
import { QrCodeModule } from 'src/app/qr-code/qr-code.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HomePageRoutingModule,
        CoreModule,
        QrCodeModule
    ],
    declarations: [HomePage]
})
export class HomePageModule {}
