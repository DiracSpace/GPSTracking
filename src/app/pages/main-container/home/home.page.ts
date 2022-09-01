import { ApiService } from 'src/app/api/ApiService.service';
import {
    AlertController,
    LoadingController,
    Platform,
    ToastController
} from '@ionic/angular';
import { Logger, LogLevel } from 'src/app/logger';
import { Component, OnInit } from '@angular/core';
import { Navigation } from 'src/app/navigation';
import { Location, User } from 'src/app/views';
import { formatToBlobName } from 'src/app/views/User/User';
import { AndroidPermissionsUtils } from 'src/app/services/android-permissions-utils.service';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { handleAndDecode } from 'src/app/utils/promises';
import { decodeErrorDetails, ErrorDetails } from 'src/app/utils/errors';
import { Geolocation, Geoposition } from '@awesome-cordova-plugins/geolocation/ngx';
import { guid } from 'src/app/utils';

const logger = new Logger({
    source: 'HomePage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
    viewCode: boolean = true;
    loading = false;
    user = new User();

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastController,
        private nav: Navigation,
        private api: ApiService,
        private debug: Debugger,
        private platform: Platform,
        private androidPermissions: AndroidPermissions,
        private androidPermissionsUtils: AndroidPermissionsUtils,
        private alerts: AlertController,
        private geolocation: Geolocation
    ) { }

    ngOnInit(): void {
        this.loadAsync();
        this.backgroundLocationListener();
    }

    /* #region getters */
    get qrCodeInformation() {
        return this.user.qrCodeUrl;
    }

    get qrCodeSrc() {
        return this.user.qrCodeBase64;
    }

    get username() {
        return this.user.username ?? this.user.email;
    }

    get scannerBtnText() {
        return this.viewCode ? 'Escanear un código QR' : 'Regresar';
    }
    /* #endregion */

    async onLogoutClicked() {
        const loadingDialog = await this.loadingController.create({
            message: 'Cerrando Sesión'
        });
        await loadingDialog.present();
        await this.api.auth.signOut();
        await loadingDialog.dismiss();
        this.nav.login.go();
    }

    async onQrSrcObtained(qrSrc: Blob) {
        if (!qrSrc) {
            throw 'No source provided for upload to storage!';
        }

        if (qrSrc.size < 1) {
            throw 'No blob content!';
        }

        if (this.user.qrCodeUrl.includes('firebasestorage')) {
            logger.log('Already uploaded to storage!');
            return;
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Generando el código QR'
        });
        await loadingDialog.present();

        try {
            logger.log('qrSrc:', qrSrc);
            const fileName = formatToBlobName(this.user.uid);
            logger.log('waiting...');
            const resourceUrl = await this.api.storage.uploadBlobWithProgressAsync(
                qrSrc,
                fileName
            );

            logger.log('resourceUrl:', resourceUrl);
            if (!resourceUrl) {
                throw 'Could not get resourceUrl';
            }
            logger.log('resourceUrl:', resourceUrl);
            this.user.qrCodeUrl = resourceUrl;
            await this.api.users.updateAsync(this.user.uid, this.user);
        } catch (error) {
            await loadingDialog.dismiss();
            const toast = await this.toasts.create({
                message: error,
                duration: 800
            });
            await toast.present();
        }

        await loadingDialog.dismiss();
    }

    onEditProfileClicked() {
        this.nav.mainContainer.profileSettings.go();
    }

    onClickScanQRCode() {
        this.viewCode = !this.viewCode;
    }

    async onLocationClicked() {
        const permissionsVerified = await this.verifyPermissionForGpsAsync();

        if (!permissionsVerified) {
            return;
        }

        const geoposition = await this.getMyLocationAsync();
        const { latitude, longitude } = geoposition.coords;
        this.debug.info(`User's location is ${latitude} ${longitude}`);

        const loadingDialog = await this.loadingController.create({
            message: 'Actualizando su ubicación'
        });
        await loadingDialog.present();
        try {
            const location: Location = {
                id: guid(),
                uid: this.user.uid,
                latitude: latitude,
                longitude: longitude
            };

            await this.api.location.createAsync(location);
        } catch (error) {
            await loadingDialog.dismiss();
            const toast = await this.toasts.create({
                message: error,
                duration: 800
            });
            await toast.present();
        }

        await loadingDialog.dismiss();
    }

    private async loadAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        const user = await this.api.auth.currentUser;

        if (!user) {
            await loadingDialog.dismiss();

            const toast = await this.toasts.create({
                message: 'No se pudo autenticar. Por favor vuelva a iniciar sesión',
                duration: 800
            });
            await toast.present();

            this.api.auth.signOut();
            this.nav.login.go();
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(user.uid);
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
        this.loading = false;
    }

    private async backgroundLocationListener() {
        const result = await this.api.backgroundLocation.attachWatcherListener();
        logger.log("result:", result);
    }

    private async verifyPermissionForGpsAsync(): Promise<boolean> {
        this.debug.info('onLocationClicked');

        if (!this.platform.is('android')) {
            this.debug.info('Platform is not android');
            this.debug.info('Android permission is not necessary');
            return true;
        }

        this.debug.info('Platform is android');
        this.debug.info('Android permission must be requested');

        // prettier-ignore
        const locationPermission = this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION;

        const { result: hasPermission, error: hasPermissionError } =
            await handleAndDecode(
                this.androidPermissionsUtils.hasAndroidPermissionAsync(locationPermission)
            );

        if (hasPermissionError) {
            await this.showErrorAlertAsync(hasPermissionError);
            return false;
        }

        if (!hasPermission) {
            const {
                result: canRequestLocationAccuracy,
                error: canRequestLocationAccuracyError
            } = await handleAndDecode(
                this.androidPermissionsUtils.canRequestLocationAccuracy()
            );

            if (canRequestLocationAccuracyError) {
                await this.showErrorAlertAsync(canRequestLocationAccuracyError);
                return false;
            }

            if (!canRequestLocationAccuracy) {
                const { result: permissionGranted, error: permissionGrantedError } =
                    await handleAndDecode(
                        this.androidPermissionsUtils.requestAndroidPermissionAsync(
                            locationPermission
                        )
                    );

                if (permissionGrantedError) {
                    await this.showErrorAlertAsync(permissionGrantedError);
                    return false;
                }

                if (!permissionGranted) {
                    return false;
                }
            }
        }

        const { error: turnOnGpsError } = await handleAndDecode(
            this.androidPermissionsUtils.turnOnGpsAsync()
        );

        if (turnOnGpsError) {
            await this.showErrorAlertAsync(turnOnGpsError);
            return false;
        }

        return true;
    }

    private async showAlertAsync(message: string) {
        const alert = await this.alerts.create({
            message
        });
        await alert.present();
        return alert;
    }

    private async showErrorAlertAsync(error: ErrorDetails) {
        const errorString = error.toString();
        this.debug.error(errorString);
        return await this.showAlertAsync(errorString);
    }

    private async getMyLocationAsync(): Promise<Geoposition> {
        this.debug.info("Trying to get user's location...");

        const loadingModal = await this.loadingController.create({
            message: 'Obteniendo tu ubicación...'
        });

        loadingModal.present();

        this.debug.info("Getting user's location...");

        try {
            const geoposition = await this.geolocation.getCurrentPosition({
                timeout: 10000, // TODO Make this an env var?
                enableHighAccuracy: true, // TODO Make this an env var?
                maximumAge: 0 // TODO Make this an env var?
            });

            return geoposition;
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            await this.showErrorAlertAsync(errorDetails);
            throw error;
        } finally {
            loadingModal.dismiss();
        }
    }
}
