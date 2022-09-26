import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonBackButtonDelegate, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import {
    ArgumentNullError,
    NotImplementedError,
    RequiredPropError
} from 'src/app/errors';
import { Logger, LogLevel } from 'src/app/logger';
import { Navigation } from 'src/app/navigation';
import { AlertUtils } from 'src/app/services';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { guid } from 'src/app/utils';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { PhoneNumberOwnerTypes, User, UserPhoneNumber } from 'src/app/views';

@Component({
    selector: 'app-phone-numbers-settings',
    templateUrl: './phone-numbers-settings.page.html',
    styleUrls: ['./phone-numbers-settings.page.scss']
})
export class PhoneNumbersSettingsPage implements OnInit {
    ownerTypes = PhoneNumberOwnerTypes;
    user = new User();

    loading = false;
    canEdit = true;

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
            return 'Números del Usuario buscado';
        }

        return `Usuario: ${this.user.firstName} ${this.user.lastNameFather}`;
    }

    get phoneNumbers(): UserPhoneNumber[] {
        if (this.user.phoneNumbers == undefined || this.user.phoneNumbers == null) {
            return [];
        }

        return this.user.phoneNumbers;
    }

    isFormValid(phoneNumber: UserPhoneNumber) {
        return !phoneNumber.number || !phoneNumber.owner;
    }

    async onAddClicked() {
        const phoneNumber = new UserPhoneNumber();
        phoneNumber.id = guid();
        this.user.phoneNumbers.push(phoneNumber);
    }

    async onDeleteClick(phoneNumber: UserPhoneNumber) {
        if (!phoneNumber) {
            return;
        }

        const caller = 'onDeleteClick';
        RequiredPropError.throwIfNull(this.phoneNumbers, 'phoneNumbers', caller);

        const index = this.user.phoneNumbers.indexOf(phoneNumber);

        if (index == -1) {
            let message = 'Could not find phone number to delete';
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
            this.user.phoneNumbers.splice(index, 1);

            const loadingDialog = await this.loadingController.create({
                message: 'Eliminando...'
            });
            await loadingDialog.present();

            try {
                await this.api.users.removeArrayElementAsync(
                    'phoneNumbers',
                    this.user.uid,
                    phoneNumber
                );
            } catch (error) {
                await loadingDialog.dismiss();
                await this.toasts.presentToastAsync(error, 'danger');
                return;
            }

            await loadingDialog.dismiss();
        }
    }

    async onSaveClicked() {
        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });
        await loadingDialog.present();

        try {
            await this.api.users.updateUserListPropertyAsync<UserPhoneNumber>(
                'phoneNumbers',
                this.user.uid,
                this.user.phoneNumbers
            );
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
        await this.toasts.presentToastAsync('¡Se guardó existosamente!');
    }

    getPhoneNumberDescription(phoneNumber: UserPhoneNumber): string {
        const caller = 'getPhoneNumberOrDefault';
        ArgumentNullError.throwIfNull(phoneNumber, 'phoneNumber', caller);

        if (!phoneNumber.number) {
            return 'Desconocido';
        }

        const parts: string[] = [phoneNumber.number];

        if (phoneNumber.owner) {
            parts.push(phoneNumber.owner);
        }

        return parts.join(' | ');
    }

    isPhoneNumberOwnerNotMine(phoneNumber: UserPhoneNumber): boolean {
        const caller = 'isPhoneNumberOwnerNotMine';
        ArgumentNullError.throwIfNull(phoneNumber, 'phoneNumber', caller);
        return phoneNumber.owner != 'Mío';
    }

    isPhoneNumberOwnerOther(phoneNumber: UserPhoneNumber): boolean {
        const caller = 'isPhoneNumberOwnerOther';
        ArgumentNullError.throwIfNull(phoneNumber, 'phoneNumber', caller);
        return phoneNumber.owner == 'Otro';
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
