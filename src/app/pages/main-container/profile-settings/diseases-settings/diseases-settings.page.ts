import { User, UserDiseaseDetail } from 'src/app/views';
import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { Logger, LogLevel } from 'src/app/logger';
import { guid } from 'src/app/utils';
import { NotImplementedError } from 'src/app/errors';
import { ToastsService } from 'src/app/services/toasts.service';

const logger = new Logger({
    source: 'DiseasesSettingsPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-diseases-settings',
    templateUrl: './diseases-settings.page.html',
    styleUrls: ['./diseases-settings.page.scss']
})
export class DiseasesSettingsPage implements OnInit {
    user = new User();
    diseaseInput = new UserDiseaseDetail();

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastsService,
        private api: ApiService
    ) {}

    ngOnInit() {
        this.loadAsync();
    }

    get diseases(): UserDiseaseDetail[] {
        if (this.user.diseases == undefined || this.user.diseases == null) {
            return [];
        }

        return this.user.diseases;
    }

    onDiseaseEnter() {
        if (!this.diseaseInput) {
            return;
        }

        this.diseases.push(this.diseaseInput);
    }

    onAddClicked() {
        logger.log('Adding new!');
        const disease = new UserDiseaseDetail();
        disease.id = guid();
        this.user.diseases.push(disease);
    }

    async onDeleteClicked(disease: UserDiseaseDetail) {
        const caller = 'onDeleteClicked';
        const index = this.diseases.indexOf(disease);

        if (index == -1) {
            throw new NotImplementedError('Could not find disease to delete', caller);
        }

        this.diseases.splice(index, 1);

        const loadingDialog = await this.loadingController.create({
            message: 'Eliminando...'
        });
        await loadingDialog.present();

        try {
            logger.log('disease:', disease);
            await this.api.users.removeArrayElementAsync(
                'diseases',
                this.user.uid,
                disease
            );
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
    }

    async onSaveClicked(disease: UserDiseaseDetail) {
        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });
        await loadingDialog.present();

        try {
            logger.log('disease:', disease);
            await this.api.users.updateArrayAsync('diseases', this.user.uid, disease);
        } catch (error) {
            logger.log('error:', error);
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
