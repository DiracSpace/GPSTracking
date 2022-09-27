import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonBackButtonDelegate, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { NotImplementedError, RequiredPropError } from 'src/app/errors';
import { Logger, LogLevel } from 'src/app/logger';
import { Navigation } from 'src/app/navigation';
import { AlertUtils } from 'src/app/services';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { guid } from 'src/app/utils';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { AddressTypeTypes, MexicoStates, User, UserAddress } from 'src/app/views';
import { getUserAddressDescription } from 'src/app/views/User/UserAddress';

@Component({
    selector: 'app-addresses-settings',
    templateUrl: './addresses-settings.page.html',
    styleUrls: ['./addresses-settings.page.scss']
})
export class AddressesSettingsPage implements OnInit {
    addressTypes = AddressTypeTypes;
    states = MexicoStates;
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
            return 'Direcciones del Usuario buscado';
        }

        return `Usuario: ${this.user.firstName} ${this.user.lastNameFather}`;
    }

    get addresses(): UserAddress[] {
        if (this.user.addresses == undefined || this.user.addresses == null) {
            return [];
        }

        return this.user.addresses;
    }

    isFormValid(address: UserAddress): boolean {
        // Require minimum info so user does not get annoyed
        return !address.state || !address.county;
    }

    async onAddClicked() {
        const address = new UserAddress();
        address.id = guid();
        this.user.addresses.push(address);
    }

    async onDeleteClick(address: UserAddress) {
        if (!address) {
            return;
        }

        const caller = 'onDeleteClick';
        RequiredPropError.throwIfNull(this.addresses, 'addresses', caller);

        const index = this.user.addresses.indexOf(address);

        if (index == -1) {
            const message = 'Could not find address to delete';
            await this.toasts.presentToastAsync(message, 'danger');
            return;
        }

        const confirmation = await this.toasts.presentAlertAsync(
            'Confirmación',
            'Está por eliminar información',
            '¿Desea eliminar este dato?',
            'yes'
        );

        if (confirmation) {
            this.user.addresses.splice(index, 1);

            const loadingDialog = await this.loadingController.create({
                message: 'Eliminando...'
            });
            await loadingDialog.present();

            try {
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

    async onSaveClicked() {
        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });
        await loadingDialog.present();

        try {
            await this.api.users.updateUserListPropertyAsync<UserAddress>(
                'addresses',
                this.user.uid,
                this.user.addresses
            );
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
        await this.toasts.presentToastAsync('¡Se guardó existosamente!');
    }

    getAddressDescription(address: UserAddress) {
        return getUserAddressDescription(address);
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
