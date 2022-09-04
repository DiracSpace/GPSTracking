import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugComponent } from './components/debug/debug.component';
import { FormControlErrorComponent } from './components/form-control-error/form-control-error.component';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from './components/logo/logo.component';
import { LogoImgComponent } from './components/logo-img/logo-img.component';
import { LoadingImgComponent } from './components/loading-img/loading-img.component';

const ModuleComponents = [
    // Add components that should be re-usable inside this module only
];

const ExportedComponents = [
    DebugComponent,
    FormControlErrorComponent,
    LogoComponent,
    LogoImgComponent,
    LoadingImgComponent,
    // Add components that should be re-usable from another module
];

@NgModule({
    imports: [CommonModule, IonicModule],
    declarations: [...ModuleComponents, ...ExportedComponents],
    exports: [...ExportedComponents]
})
export class CoreModule {}
