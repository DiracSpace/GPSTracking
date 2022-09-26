import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TokenGuard } from '../main-container/token-guard.service';

import { UserPage } from './user.page';

const routes: Routes = [
    {
        path: '',
        component: UserPage
        // canActivate: [TokenGuard] // Not necessary since external providers can also scan qr codes.
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserPageRoutingModule {}
