import { ApiService } from 'src/app/api/ApiService.service';
import { IonBackButtonDelegate, LoadingController, NavController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/views';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { ActivatedRoute } from '@angular/router';
import { Navigation } from 'src/app/navigation';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { AlertUtils } from 'src/app/services';
import { Logger, LogLevel } from 'src/app/logger';
import { Debugger } from 'src/app/core/components/debug/debugger.service';

@Component({
    selector: 'app-names-settings',
    templateUrl: './names-settings.page.html',
    styleUrls: ['./names-settings.page.scss']
})
export class NamesSettingsPage implements OnInit {
    canEdit = true;
    loading = false;
    user = new User();

    constructor(
        private loadingController: LoadingController,
        private activatedRoute: ActivatedRoute,
        private navController: NavController,
        private toasts: ToastsService,
        private alerts: AlertUtils,
        private nav: Navigation,
        private api: ApiService,
        private debug: Debugger
    ) {}

    ngOnInit() {
        this.tryLoadUserAsync();
    }

    get userId(): string | undefined {
        return this.activatedRoute.snapshot.params.id;
    }

    get name() {
        if (!this.user.firstName || !this.user.lastNameFather) {
            return 'Datos básicos del Usuario buscado';
        }

        return `Usuario: ${this.user.firstName} ${this.user.lastNameFather}`;
    }

    get email() {
        return this.user.email;
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
            const authUser = await this.api.auth.getCurrentUserAsync();
            if (this.userId && authUser.uid != this.userId) {
                this.canEdit = false;
            }

            const uid = this.userId ?? authUser.uid;
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
