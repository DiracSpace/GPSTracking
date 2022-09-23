import { ApiService } from 'src/app/api/ApiService.service';
import { LoadingController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/views';
import { ToastsService } from 'src/app/services/popups/toasts.service';

@Component({
    selector: 'app-names-settings',
    templateUrl: './names-settings.page.html',
    styleUrls: ['./names-settings.page.scss']
})
export class NamesSettingsPage implements OnInit {
    loading = false;
    user = new User();

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastsService,
        private api: ApiService
    ) {}

    ngOnInit() {
        this.initAsync();
    }

    get firstName() {
        return this.user.firstName;
    }
    set firstName(value: string) {
        this.user.firstName = value;
    }

    get middleName() {
        return this.user.middleName;
    }
    set middleName(value: string) {
        this.user.middleName = value;
    }

    get lastNameFather() {
        return this.user.lastNameFather;
    }
    set lastNameFather(value: string) {
        this.user.lastNameFather = value;
    }

    get lastNameMother() {
        return this.user.lastNameMother;
    }
    set lastNameMother(value: string) {
        this.user.lastNameMother = value;
    }

    get username() {
        return this.user.username;
    }
    set username(value: string) {
        this.user.username = value;
    }

    async onSaveClicked() {
        console.log('user', this.user);

        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });

        await loadingDialog.present();

        try {
            await this.api.users.updateAsync(this.user.uid, this.user);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
    }

    private async initAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        let authUser = null;
        try {
            authUser = await this.api.auth.getCurrentUserAsync();
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        if (!authUser) {
            let message = 'No se pudo autenticar. Por favor vuelva a iniciar sesión';
            await this.toasts.presentToastAsync(message, 'warning');
            await this.api.auth.signOut();
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(authUser.uid);

        await loadingDialog.dismiss();
        this.loading = false;
    }
}
