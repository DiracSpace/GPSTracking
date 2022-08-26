import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { ProfileCompletionGuard } from './profile-completion-guard.service';

const routes: Routes = [
    {
        path: '',
        component: HomePage,
        canActivate: [ProfileCompletionGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomePageRoutingModule {}
