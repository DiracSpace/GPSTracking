import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadChildren: () =>
            import('./pages/login/login.module').then((m) => m.LoginPageModule)
    },
    {
        path: 'sign-up',
        loadChildren: () =>
            import('./pages/sign-up/sign-up.module').then((m) => m.SignUpPageModule)
    },
    {
        path: 'main-container',
        loadChildren: () =>
            import('./pages/main-container/main-container.module').then(
                (m) => m.MainContainerPageModule
            )
    },
    {
        path: 'qr',
        loadChildren: () => import('./qr-code/qr-code.module').then((m) => m.QrCodeModule)
    },
    {
        path: 'user/:id',
        loadChildren: () =>
            import('./pages/user/user.module').then((m) => m.UserPageModule)
    },
    {
        path: 'user-locations/:uid',
        loadChildren: () =>
            import('./pages/user-locations/user-locations.module').then(
                (m) => m.UserLocationsPageModule
            )
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
