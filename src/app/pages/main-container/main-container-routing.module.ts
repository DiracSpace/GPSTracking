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
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainContainerPageRoutingModule {}
