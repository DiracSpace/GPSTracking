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
    @ViewChild(IonBackButtonDelegate, { static: false })
    backButton: IonBackButtonDelegate;

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
