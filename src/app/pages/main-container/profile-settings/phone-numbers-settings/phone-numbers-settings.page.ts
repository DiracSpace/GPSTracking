import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import {
    ArgumentNullError,
    NotImplementedError,
    RequiredPropError
} from 'src/app/errors';
import { Logger, LogLevel } from 'src/app/logger';
import { State } from 'src/app/state';
import { guid } from 'src/app/utils';
import { wait } from 'src/app/utils/time';
import { PhoneNumberOwnerTypes, User, UserPhoneNumber } from 'src/app/views';

const logger = new Logger({
    source: 'PhoneNumbersSettingsPage',
    level: LogLevel.Debug
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
        private toastController: ToastController,
        private api: ApiService,
        private state: State
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
        const caller = 'onDeleteClick';
        RequiredPropError.throwIfNull(this.phoneNumbers, 'phoneNumbers', caller);

        const index = this.phoneNumbers.indexOf(phoneNumber);

        if (index == -1) {
            throw new NotImplementedError(
                'Could not find phone number to delete',
                caller
            );
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Eliminando...'
        });
        await loadingDialog.present();

        try {
            logger.log('phoneNumber:', phoneNumber);
            await this.api.users.removeArrayElementAsync(this.user.uid, phoneNumber);
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

    async onSaveClicked(phoneNumber: UserPhoneNumber) {
        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });
        await loadingDialog.present();

        try {
            logger.log('phoneNumber:', phoneNumber);
            await this.api.users.updateArrayAsync(this.user.uid, phoneNumber);
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

        await loadingDialog.dismiss();
    }
}
