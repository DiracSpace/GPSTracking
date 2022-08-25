import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugComponent } from './debug/debug.component';

const ModuleComponents = [
    // Add components that should be re-usable inside this module only
];

const ExportedComponents = [
    DebugComponent
    // Add components that should be re-usable from another module
];

@NgModule({
    imports: [CommonModule],
    declarations: [...ModuleComponents, ...ExportedComponents],
    exports: [...ExportedComponents]
})
export class CoreModule {}
