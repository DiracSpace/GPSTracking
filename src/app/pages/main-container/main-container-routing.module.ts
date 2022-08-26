import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainContainerPage } from './main-container.page';
import { TokenGuard } from './token-guard.service';

const routes: Routes = [
    {
        path: '',
        component: MainContainerPage,
        canActivate: [TokenGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'home'
            },
            {
                path: 'first-steps',
                loadChildren: () =>
                    import('./first-steps/first-steps.module').then(
                        (m) => m.FirstStepsPageModule
                    )
            },
            {
                path: 'home',
                loadChildren: () =>
                    import('./home/home.module').then((m) => m.HomePageModule)
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
