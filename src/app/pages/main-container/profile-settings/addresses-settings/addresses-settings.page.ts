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

const logger = new Logger({
    source: 'AddressesSettingsPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-addresses-settings',
    templateUrl: './addresses-settings.page.html',
    styleUrls: ['./addresses-settings.page.scss']
})
export class AddressesSettingsPage implements OnInit {
    @ViewChild(IonBackButtonDelegate, { static: false })
    backButton: IonBackButtonDelegate;

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

    /**
     * Callback for Ionic lifecycle
     */
    ionViewDidEnter() {
        this.backButton.onClick = this.backButtonOnClick;
    }

    /**
     * Go back 2 pages if comming from qr code scan.
     *
     * This will prevent a bug where the screen goes black if the user has navigated to this page via qr scanner.
     *
     * https://forum.ionicframework.com/t/how-to-go-back-multiple-pages-in-ionic/118733/4
     *
     * https://stackoverflow.com/questions/48336846/how-to-go-back-multiple-pages-in-ionic-3
     */
    readonly backButtonOnClick = () => {
        // TODO As a solution for now, take user to home page, navigating backwards (or maybe this is the solution we want).
        const route = this.nav.mainContainer.home.path;
        this.navController.navigateBack(route);
    };

    get userId(): string | undefined {
        const userId = this.activatedRoute.snapshot.queryParams.userId;
        return userId;
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
        logger.log('Adding new!');
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
            let message = 'Could not find address to delete';
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
                logger.log('address:', address);
                logger.log('this.user:', this.user);
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
            logger.log('this.user:', this.user);
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
            this.backButtonOnClick();
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
            logger.log('this.user:', this.user);
            logger.log('this.canEdit:', this.canEdit);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
        this.loading = false;
    }
}
