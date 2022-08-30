import { User, UserAlergyDetail } from 'src/app/views';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { State } from 'src/app/state';
import { Logger, LogLevel } from 'src/app/logger';
import { guid } from 'src/app/utils';
import { NotImplementedError } from 'src/app/errors';

const logger = new Logger({
    source: 'AlergiesSettingsPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-alergies-settings',
    templateUrl: './alergies-settings.page.html',
    styleUrls: ['./alergies-settings.page.scss']
})
export class AlergiesSettingsPage implements OnInit {
    user = new User();
    alergyInput = new UserAlergyDetail();

    constructor(
        private loadingController: LoadingController,
        private toastController: ToastController,
        private api: ApiService,
        private state: State
    ) {}

    ngOnInit() {
        this.loadAsync();
    }

    get alergies(): UserAlergyDetail[] {
        if (this.user.alergies == undefined || this.user.alergies == null) {
            return [];
        }

        return this.user.alergies;
    }

    onAlergyEnter() {
        if (!this.alergyInput) {
            return;
        }

        this.alergies.push(this.alergyInput);
    }

    onAddClicked() {
        logger.log('Adding new!');
        const alergy = new UserAlergyDetail();
        alergy.id = guid();
        this.user.alergies.push(alergy);
    }

    async onDeleteClicked(alergy: UserAlergyDetail) {
        if (!alergy) {
            return;
        }

        const caller = 'onDeleteClicked';
        const index = this.alergies.indexOf(alergy);

        if (index == -1) {
            throw new NotImplementedError('Could not find alergy to delete', caller);
        }

        this.alergies.splice(index, 1);

        const loadingDialog = await this.loadingController.create({
            message: 'Eliminando...'
        });
        await loadingDialog.present();

        try {
            logger.log('alergy:', alergy);
            await this.api.users.removeArrayElementAsync(
                'alergies',
                this.user.uid,
                alergy
            );
        } catch (error) {
            logger.log('error:', error);
            await loadingDialog.dismiss();
            const toast = await this.toastController.create({
                message: error,
                duration: 800
            });
            await toast.present();
            return;
        }

        await loadingDialog.dismiss();
    }

    async onSaveClicked(alergy: UserAlergyDetail) {
        if (!alergy) {
            return;
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });
        await loadingDialog.present();

        try {
            logger.log('alergy:', alergy);
            await this.api.users.updateArrayAsync('alergies', this.user.uid, alergy);
        } catch (error) {
            logger.log('error:', error);
            await loadingDialog.dismiss();
            const toast = await this.toastController.create({
                message: error,
                duration: 800
            });
            await toast.present();
            return;
        }

        await loadingDialog.dismiss();
    }

    private async loadAsync() {
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        const user = await this.api.auth.currentUser;

        if (!user) {
            await loadingDialog.dismiss();

            const toast = await this.toastController.create({
                message: 'No se pudo autenticar. Por favor vuelva a iniciar sesión',
                duration: 800
            });
            await toast.present();
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(user.uid);
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
    }
}
