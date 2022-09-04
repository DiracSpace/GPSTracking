import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { NotImplementedError, RequiredPropError } from 'src/app/errors';
import { Logger, LogLevel } from 'src/app/logger';
import { ToastsService } from 'src/app/services/toasts.service';
import { guid } from 'src/app/utils';
import { AddressTypeTypes, MexicoStates, User, UserAddress } from 'src/app/views';
import { getAddressDescription } from 'src/app/views/User/UserAddress';

const logger = new Logger({
    source: 'AddressesSettingsPage',
    level: LogLevel.Off
});

@Component({
    selector: 'app-addresses-settings',
    templateUrl: './addresses-settings.page.html',
    styleUrls: ['./addresses-settings.page.scss']
})
export class AddressesSettingsPage implements OnInit {
    addressTypes = AddressTypeTypes;
    user = new User();
    states = MexicoStates;

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastsService,
        private api: ApiService
    ) {}

    ngOnInit() {
        this.loadAsync();
    }

    get addresses(): UserAddress[] {
        if (this.user.addresses == undefined || this.user.addresses == null) {
            return [];
        }

        return this.user.addresses;
    }

    get defaultAddress(): UserAddress {
        return this.addresses.find((x) => x.isDefault);
    }

    async onAddClicked() {
        logger.log('Adding new!');
        const address = new UserAddress();
        address.id = guid();
        this.addresses.push(address);
    }

    async onDeleteClick(address: UserAddress) {
        if (!address) {
            return;
        }

        const caller = 'onDeleteClick';
        RequiredPropError.throwIfNull(this.addresses, 'addresses', caller);

        const index = this.addresses.indexOf(address);

        if (index == -1) {
            let message = 'Could not find address to delete';
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
            this.addresses.splice(index, 1);

            const loadingDialog = await this.loadingController.create({
                message: 'Eliminando...'
            });
            await loadingDialog.present();

            try {
                logger.log('address:', address);
                await this.api.users.removeArrayElementAsync(
                    'addresses',
                    this.user.uid,
                    address
                );
            } catch (error) {
                await loadingDialog.dismiss();
                await this.toasts.presentToastAsync(error, 'danger');
                return;
            }

            await loadingDialog.dismiss();
        }
    }

    async onSaveClicked(address: UserAddress) {
        if (!address) {
            return;
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });
        await loadingDialog.present();

        try {
            logger.log('address:', address);
            await this.api.users.updateArrayAsync('addresses', this.user.uid, address);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
        await this.toasts.presentToastAsync('¡Se guardó existosamente!');
    }

    getAddressDescription(address: UserAddress) {
        return getAddressDescription(address);
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
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(user.uid);
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
    }
}
