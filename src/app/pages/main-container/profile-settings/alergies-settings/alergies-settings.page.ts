import { User, UserAlergyDetail } from 'src/app/views';
import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { Logger, LogLevel } from 'src/app/logger';
import { guid } from 'src/app/utils';
import { NotImplementedError } from 'src/app/errors';
import { ToastsService } from 'src/app/services/toasts.service';

const logger = new Logger({
    source: 'AlergiesSettingsPage',
    level: LogLevel.Off
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
        private toasts: ToastsService,
        private api: ApiService
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
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
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
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
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
            let message = 'No se pudo autenticar. Por favor vuelva a iniciar sesión';
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(message, 'warning');
            await this.api.auth.signOut();
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(user.uid);
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
    }
}
