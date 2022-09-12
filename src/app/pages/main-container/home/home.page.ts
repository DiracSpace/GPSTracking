import { ApiService } from 'src/app/api/ApiService.service';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Logger, LogLevel } from 'src/app/logger';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Navigation } from 'src/app/navigation';
import { Location, User, UserLocation } from 'src/app/views';
import { formatToBlobName } from 'src/app/views/User/User';
import { AndroidPermissionsUtils } from 'src/app/services/android-permissions-utils.service';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { handleAndDecode } from 'src/app/utils/promises';
import { decodeErrorDetails, ErrorDetails } from 'src/app/utils/errors';
import { Geolocation, Geoposition } from '@awesome-cordova-plugins/geolocation/ngx';
import { guid } from 'src/app/utils';
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { repeatWhen, takeUntil } from 'rxjs/operators';
import { ScannerPermissions } from '../scanner/scanner-permissions.service';
import { ToastsColorCodes, ToastsService } from 'src/app/services/toasts.service';
import { ContextService } from 'src/app/services/context.service';
import { userLocations } from 'src/app/core/components/bottom-navigation/bottom-navigation.component';
import { formatToDocumentName } from 'src/app/views/Location/Location';

const logger = new Logger({
    source: 'HomePage',
    level: LogLevel.Debug
});

// 1 hour = 3600000
// 1 minute = 60000
const BACKGROUND_GPS_INTERVAL = 3600000;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
    viewCode: boolean = true;
    loading = false;
    scanning = false;
    user = new User();

    private platformName: string = null;
    hasPlatformFinishedLoading: boolean = false;

    private idleInterval: Observable<number>;
    closeIdleIntervalObservable() {
        if (this.idleInterval) {
            this.idleInterval = null;
        }
    }

    private readonly _restartInterval = new Subject<void>();
    private readonly _stopInterval = new Subject<void>();

    private listenSubscription: Subscription;
    closeListenSubscription() {
        if (this.listenSubscription) {
            this.listenSubscription.unsubscribe();
            this.listenSubscription = null;
        }
    }

    constructor(
        private androidPermissionsUtils: AndroidPermissionsUtils,
        private androidPermissions: AndroidPermissions,
        private scannerPermissions: ScannerPermissions,
        private loadingController: LoadingController,
        private geolocation: Geolocation,
        private context: ContextService,
        private alerts: AlertController,
        private toasts: ToastsService,
        private platform: Platform,
        private nav: Navigation,
        private api: ApiService,
        private debug: Debugger
    ) {
        platform.ready().then((result: string) => {
            this.platformName = result;

            debug.info('Platform ready:', result);
            logger.log('result:', result);

            debug.info('Platform name:', this.platformName);
            logger.log('this.platformName:', this.platformName);
            this.hasPlatformFinishedLoading = true;
        });
    }

    ngOnInit(): void {
        this.loadAsync();
        this.backgroundLocationListener();
    }

    ngOnDestroy(): void {
        this.closeIdleIntervalObservable();
        this.closeListenSubscription();
    }

    /* #region getters */
    get qrCodeSrc() {
        return this.user.qrCodeBase64;
    }

    get username() {
        return this.user.username ?? this.user.email;
    }

    get scannerBtnText() {
        return this.viewCode ? 'Escanear un código QR' : 'Regresar';
    }

    get isScannerAvailable(): boolean {
        return this.scannerPermissions.isAvailableForPlatform;
    }

    /* #endregion */

    onProfileClicked() {
        this.nav.user(this.user.uid).go();
    }

    async onLogoutClicked() {
        const confirmation = await this.toasts.presentAlertAsync(
            'Confirmación',
            'Está por cerrar su sesión',
            '¿Desea salir de su sesión?',
            'yes'
        );

        if (confirmation) {
            const loadingDialog = await this.loadingController.create({
                message: 'Cerrando Sesión'
            });
            await loadingDialog.present();
            await this.api.auth.signOut();
            await loadingDialog.dismiss();
        }
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
            await this.toasts.presentToastAsync(error, 'danger');
        }

        await loadingDialog.dismiss();
    }

    onScanClicked() {
        this.nav.mainContainer.scanner.go();
    }

    onClickScanQRCode() {
        this.viewCode = !this.viewCode;
    }

    async onLocationClicked() {
        if (!this.platformName) {
            let message = 'No se pudo determinar el tipo dispositivo.';
            await this.toasts.presentToastAsync(message, 'warning');
            return;
        }

        if (this.platformName.includes('dom') || this.platformName == 'dom') {
            await this.requestLocationAndSaveAsync();
        } else if (
            this.platformName.includes('cordova') ||
            this.platformName == 'cordova'
        ) {
            await this.requestLocationForAndroidAsync();
        } else {
            let message = 'No se pudo determinar el tipo dispositivo.';
            await this.toasts.presentToastAsync(message, 'warning');
        }
    }

    private async requestLocationForAndroidAsync() {
        const permissionsVerified = await this.verifyPermissionForGpsAsync();

        if (!permissionsVerified) {
            return;
        }

        await this.requestLocationAndSaveAsync();
    }

    private async requestLocationAndSaveAsync() {
        const geoposition = await this.getMyLocationAsync();
        const { latitude, longitude } = geoposition.coords;
        await this.savingLocationInFirebaseAsync(latitude, longitude);
    }

    private async loadAsync() {
        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        const user = await this.api.auth.currentUser;
        const locations = await this.api.location.countAllLocationsByUserIdAsync(user.uid);
        userLocations.set(locations);

        if (!user) {
            await loadingDialog.dismiss();
            let message = 'No se pudo autenticar. Por favor vuelva a iniciar sesión';
            await this.toasts.presentToastAsync(message, 'danger');

            this.api.auth.signOut();
            this.nav.login.go();
            return;
        }

        this.user = await this.api.users.getByUidOrDefaultAsync(user.uid);
        this.context.qrImgSrc.set(this.user.qrCodeUrl);
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
        this.loading = false;
    }

    private async backgroundLocationListener() {
        if (!this.listenSubscription) {
            this.idleInterval = interval(BACKGROUND_GPS_INTERVAL);

            this.listenSubscription = this.idleInterval
                .pipe(
                    takeUntil(this._stopInterval),
                    repeatWhen(() => this._restartInterval)
                )
                .subscribe(async () => {
                    const { latitude, longitude } =
                        await this.api.backgroundLocation.attachWatcherListener();
                    this.debug.info('Saving location from background!');
                    await this.savingLocationInFirebaseAsync(latitude, longitude, true);
                });
        }
    }

    private async savingLocationInFirebaseAsync(
        latitude: number,
        longitude: number,
        fromBackground: boolean = false
    ) {
        if (!latitude || latitude == 0) {
            logger.log('No latitude provided!');
            return;
        }

        if (!longitude || longitude == 0) {
            logger.log('No longitude provided!');
            return;
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Actualizando su ubicación'
        });
        await loadingDialog.present();
        try {
            const geohash = formatToDocumentName(longitude, latitude);
            const location: Location = {
                id: guid(),
                geohash: geohash,
                latitude: latitude,
                longitude: longitude,
                fromBackground: fromBackground,
                dateRegistered: new Date()
            };

            logger.log("location:", location);
            const hasCreatedLocation = await this.api.location.createAsync(location, false);
            let message: string = '¡Se guardó existosamente!';
            let colorCode: ToastsColorCodes = 'success';
            let duration = 800;

            if (!hasCreatedLocation) {
                message =
                    'Aún no ha pasado el tiempo de espera para que vuelvas a registrar esta ubicación';
                colorCode = 'warning';
                duration = 2000;
            }

            if (hasCreatedLocation) {
                await this.api.userLocation.bindLocationToUserAsync(geohash, this.user.uid, false);
            }

            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(message, colorCode, duration);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
        }
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
            logger.log("error:", error);
            const errorDetails = decodeErrorDetails(error);
            await this.showErrorAlertAsync(errorDetails);
            throw error;
        } finally {
            loadingModal.dismiss();
        }
    }
}
