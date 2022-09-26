import { User, UserAlergyDetail } from 'src/app/views';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonBackButtonDelegate, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { Logger, LogLevel } from 'src/app/logger';
import { guid } from 'src/app/utils';
import { NotImplementedError } from 'src/app/errors';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { Navigation } from 'src/app/navigation';
import { AlertUtils } from 'src/app/services';
import { ActivatedRoute } from '@angular/router';
import { decodeErrorDetails } from 'src/app/utils/errors';

@Component({
    selector: 'app-alergies-settings',
    templateUrl: './alergies-settings.page.html',
    styleUrls: ['./alergies-settings.page.scss']
})
export class AlergiesSettingsPage implements OnInit {
    canEdit = true;
    loading = false;

    user = new User();
    alergyInput = new UserAlergyDetail();

    constructor(
        private loadingController: LoadingController,
        private activatedRoute: ActivatedRoute,
        private navController: NavController,
        private toasts: ToastsService,
        private alerts: AlertUtils,
        private nav: Navigation,
        private api: ApiService
    ) {}

    ngOnInit() {
        this.tryLoadUserAsync();
    }

    get userId(): string | undefined {
        return this.activatedRoute.snapshot.params.id;
    }

    get name() {
        if (!this.user.firstName || !this.user.lastNameFather) {
            return 'Alergias del Usuario buscado';
        }

        return `Usuario: ${this.user.firstName} ${this.user.lastNameFather}`;
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
            let message = 'Could not find alergy to delete';
            await this.toasts.presentToastAsync(message, 'danger');
            throw new NotImplementedError(message, caller);
        }

        const confirmation = await this.toasts.presentAlertAsync(
            'Confirmación',
            'Está por eliminar información',
            '¿Desea eliminar este dato?',
            'yes'
        );

        if (confirmation) {
            this.alergies.splice(index, 1);

            const loadingDialog = await this.loadingController.create({
                message: 'Eliminando...'
            });
            await loadingDialog.present();

            try {
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
            await this.api.users.updateArrayAsync('alergies', this.user.uid, alergy);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
        await this.toasts.presentToastAsync('¡Se guardó existosamente!');
    }

    private async tryLoadUserAsync() {
        try {
            await this.loadUserAsync();
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            await this.alerts.error('Usuario inválido', errorDetails);
            this.navController.pop();
        }
    }

    private async loadUserAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando datos del usuario'
        });
        await loadingDialog.present();

        try {
            let authUser = await this.api.auth.getCurrentUserAsync();
            if (this.userId && authUser.uid != this.userId) {
                this.canEdit = false;
            }

            let uid = this.userId ?? authUser.uid;
            this.user = await this.api.users.getByUidOrDefaultAsync(uid);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
        this.loading = false;
    }
}
