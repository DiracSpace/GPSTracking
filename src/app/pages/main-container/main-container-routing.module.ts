import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainContainerPage } from './main-container.page';
import { ScannerPermissionsGuard } from './scanner/scanner-permissions.guard';
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
                path: 'home',
                loadChildren: () =>
                    import('./home/home.module').then((m) => m.HomePageModule)
            },
            {
                path: 'scanner',
                canActivate: [ScannerPermissionsGuard],
                loadChildren: () =>
                    import('./scanner/scanner.module').then((m) => m.ScannerPageModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainContainerPageRoutingModule {}
