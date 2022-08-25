import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugComponent } from './components/debug/debug.component';
import { FormControlErrorComponent } from './components/form-control-error/form-control-error.component';
import { IonicModule } from '@ionic/angular';

const ModuleComponents = [
    // Add components that should be re-usable inside this module only
];

const ExportedComponents = [
    DebugComponent,
    FormControlErrorComponent
    // Add components that should be re-usable from another module
];

@NgModule({
    imports: [CommonModule, IonicModule],
    declarations: [...ModuleComponents, ...ExportedComponents],
    exports: [...ExportedComponents]
})
export class CoreModule {}
