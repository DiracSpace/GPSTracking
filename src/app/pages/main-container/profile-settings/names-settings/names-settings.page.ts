import { ApiService } from 'src/app/api/ApiService.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { State } from 'src/app/state';
import { User } from 'src/app/views';

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
        private toasts: ToastController,
        private api: ApiService,
        private state: State
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

        // TODO Update user in firestore
        try {
            await this.api.users.updateAsync(this.user.uid, this.user);
        } catch (error) {
            await loadingDialog.dismiss();
            const toast = await this.toasts.create({
                message: error,
                duration: 800
            });
            await toast.present();
            return;
        }

        // TODO Update user in app state

        await loadingDialog.dismiss();

        // TODO Go back?
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
            const toast = await this.toasts.create({
                message: error,
                duration: 800
            });
            await toast.present();
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(authUser.uid);

        await loadingDialog.dismiss();
        this.loading = false;
    }
}
