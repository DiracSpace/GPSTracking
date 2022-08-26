import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignUpPageRoutingModule } from './sign-up-routing.module';

import { SignUpPage } from './sign-up.page';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SignUpPageRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule
    ],
    declarations: [SignUpPage]
})
export class SignUpPageModule {}
