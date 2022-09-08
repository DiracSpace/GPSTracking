import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainContainerPage } from './main-container.page';
import { ScannerPermissionsGuard } from './scanner/scanner-permissions.guard';
import { TokenGuard } from './token-guard.service';

const routes: Routes = [
    {
        path: '',
        component: MainContainerPage,
        // canActivate: [TokenGuard], having trouble waiting for firebase init, comment for now
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'home'
            },
            {
                path: 'home',
                loadChildren: () =>
                    import('./home/home.module').then((m) => m.HomePageModule)
            },
            {
                path: 'scanner',
                canActivate: [ScannerPermissionsGuard],
                loadChildren: () =>
                    import('./scanner/scanner.module').then((m) => m.ScannerPageModule)
            },
            {
                path: 'profile-settings',
                loadChildren: () =>
                    import('./profile-settings/profile-settings.module').then(
                        (m) => m.ProfileSettingsPageModule
                    )
            },
            {
                path: 'profile-settings/names',
                loadChildren: () =>
                    import(
                        './profile-settings/names-settings/names-settings.module'
                    ).then((m) => m.NamesSettingsPageModule)
            },
            {
                path: 'profile-settings/phone-numbers',
                loadChildren: () =>
                    import(
                        './profile-settings/phone-numbers-settings/phone-numbers-settings.module'
                    ).then((m) => m.PhonenUmbersSettingsPageModule)
            },
            {
                path: 'profile-settings/diseases',
                loadChildren: () =>
                    import(
                        './profile-settings/diseases-settings/diseases-settings.module'
                    ).then((m) => m.DiseasesSettingsPageModule)
            },
            {
                path: 'profile-settings/alergies',
                loadChildren: () =>
                    import(
                        './profile-settings/alergies-settings/alergies-settings.module'
                    ).then((m) => m.AlergiesSettingsPageModule)
            },
            {
                path: 'profile-settings/addresses',
                loadChildren: () =>
                    import(
                        './profile-settings/addresses-settings/addresses-settings.module'
                    ).then((m) => m.AddressesSettingsPageModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainContainerPageRoutingModule {}
