import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugComponent } from './components/debug/debug.component';
import { FormControlErrorComponent } from './components/form-control-error/form-control-error.component';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from './components/logo/logo.component';
import { LogoImgComponent } from './components/logo-img/logo-img.component';
import { LoadingImgComponent } from './components/loading-img/loading-img.component';
import { BottomNavigationComponent } from './components/bottom-navigation/bottom-navigation.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LocationComponent } from './components/location/location.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { NoContentComponent } from './components/no-content/no-content.component';
import { ProfileSelectorModalComponent } from './components/profile-selector-modal/profile-selector-modal.component';

const ModuleComponents = [
    // Add components that should be re-usable inside this module only
];

const ExportedComponents = [
    DebugComponent,
    FormControlErrorComponent,
    LogoComponent,
    LogoImgComponent,
    LoadingImgComponent,
    BottomNavigationComponent,
    LocationComponent,
    AvatarComponent,
    NoContentComponent,
    ProfileSelectorModalComponent
    // Add components that should be re-usable from another module
];

@NgModule({
    imports: [CommonModule, IonicModule, LeafletModule,],
    declarations: [...ModuleComponents, ...ExportedComponents],
    exports: [...ExportedComponents]
})
export class CoreModule {}
