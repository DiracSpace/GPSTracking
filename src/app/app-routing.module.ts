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
        path: 'user/:id/names',
        loadChildren: () =>
            import(
                './pages/user/names-settings/names-settings.module'
            ).then((m) => m.NamesSettingsPageModule)
    },
    {
        path: 'user/:id/phone-numbers',
        loadChildren: () =>
            import(
                './pages/user/phone-numbers-settings/phone-numbers-settings.module'
            ).then((m) => m.PhonenUmbersSettingsPageModule)
    },
    {
        path: 'user/:id/addresses',
        loadChildren: () =>
            import(
                './pages/user/addresses-settings/addresses-settings.module'
            ).then((m) => m.AddressesSettingsPageModule)
    },
    {
        path: 'user/:id/locations',
        loadChildren: () =>
            import('./pages/user/locations-settings/locations-settings.module').then(
                (m) => m.UserLocationsPageModule
            )
    },
    {
        path: 'user/:id/diseases',
        loadChildren: () =>
            import(
                './pages/user/diseases-settings/diseases-settings.module'
            ).then((m) => m.DiseasesSettingsPageModule)
    },
    {
        path: 'user/:id/alergies',
        loadChildren: () =>
            import(
                './pages/user/alergies-settings/alergies-settings.module'
            ).then((m) => m.AlergiesSettingsPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
