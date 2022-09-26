import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PhoneNumbersSettingsPage } from './phone-numbers-settings.page';

const routes: Routes = [
    {
        path: '',
        component: PhoneNumbersSettingsPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PhonenUmbersSettingsPageRoutingModule {}
