import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import {
    ArgumentNullError,
    NotImplementedError,
    RequiredPropError
} from 'src/app/errors';
import { Logger, LogLevel } from 'src/app/logger';
import { ToastsService } from 'src/app/services/toasts.service';
import { guid } from 'src/app/utils';
import { PhoneNumberOwnerTypes, User, UserPhoneNumber } from 'src/app/views';

const logger = new Logger({
    source: 'PhoneNumbersSettingsPage',
    level: LogLevel.Off
});

@Component({
    selector: 'app-phone-numbers-settings',
    templateUrl: './phone-numbers-settings.page.html',
    styleUrls: ['./phone-numbers-settings.page.scss']
})
export class PhoneNumbersSettingsPage implements OnInit {
    user = new User();
    ownerTypes = PhoneNumberOwnerTypes;

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastsService,
        private api: ApiService
    ) {}

    ngOnInit() {
        this.loadAsync();
    }

    get phoneNumbers(): UserPhoneNumber[] {
        if (this.user.phoneNumbers == undefined || this.user.phoneNumbers == null) {
            return [];
        }

        return this.user.phoneNumbers;
    }

    async onAddClicked() {
        const phoneNumber = new UserPhoneNumber();
        phoneNumber.id = guid();
        this.phoneNumbers.push(phoneNumber);
    }

    async onDeleteClick(phoneNumber: UserPhoneNumber) {
        if (!phoneNumber) {
            return;
        }

        const caller = 'onDeleteClick';
        RequiredPropError.throwIfNull(this.phoneNumbers, 'phoneNumbers', caller);

        const index = this.phoneNumbers.indexOf(phoneNumber);

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
            this.phoneNumbers.splice(index, 1);

            const loadingDialog = await this.loadingController.create({
                message: 'Eliminando...'
            });
            await loadingDialog.present();

            try {
                logger.log('phoneNumber:', phoneNumber);
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

    async onSaveClicked(phoneNumber: UserPhoneNumber) {
        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });
        await loadingDialog.present();

        try {
            logger.log('phoneNumber:', phoneNumber);
            await this.api.users.updateArrayAsync(
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

    private async loadAsync() {
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
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(message, 'warning');
            await this.api.auth.signOut();
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(authUser.uid);

        await loadingDialog.dismiss();
    }
}
