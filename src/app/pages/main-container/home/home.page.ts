import { ApiService } from 'src/app/api/ApiService.service';
import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Navigation } from 'src/app/navigation';
import { State } from 'src/app/state';
import { User } from 'src/app/views';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
    loading = false;
    user = new User();

    constructor(
        private nav: Navigation,
        private loadingController: LoadingController,
        private api: ApiService,
    ) {}

    ngOnInit(): void {
        this.loadAsync();
    }

    get username() {
        return this.user.username;
    }

    async onLogoutClicked() {
        const loadingDialog = await this.loadingController.create({
            message: 'Cerrando Sesión'
        });
        await loadingDialog.present();
        await this.api.auth.signOut();
        await loadingDialog.dismiss();
        this.nav._.go();
    }

    onEditProfileClicked() {
        this.nav.mainContainer.profileSettings.go();
    }

    private async loadAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        await loadingDialog.dismiss();
        this.loading = false;
    }
}
