import { ApiService } from 'src/app/api/ApiService.service';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Navigation } from 'src/app/navigation';
import { User } from 'src/app/views';
import { formatToBlobName } from 'src/app/views/User/User';
import { AndroidPermissionsUtils } from 'src/app/services/android-permissions-utils.service';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { repeatWhen, takeUntil } from 'rxjs/operators';
import { ScannerPermissions } from '../scanner/scanner-permissions.service';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { ContextService } from 'src/app/services/context.service';
import { disposeSubscription } from 'src/app/utils/angular';
import { GpsUtils } from 'src/app/services';
import { userLocations } from 'src/app/core/components/bottom-navigation/bottom-navigation.component';

// 1 hour = 3600000
// 1 minute = 60000
const BACKGROUND_GPS_INTERVAL = 3600000;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
    /**
     * We need to get most recent version of database
     * to save in cache on first user login.
     *
     * It needs to start as false, so as to not check
     * cache in loadAsync function. We then set it to true.
     */
    isFirstLoad: boolean = false;

    viewCode: boolean = true;
    loading = false;
    scanning = false;
    user = new User();

    // private platformName: string = null;

    private idleInterval: Observable<number>;
    closeIdleIntervalObservable() {
        if (this.idleInterval) {
            this.idleInterval = null;
        }
    }

    private readonly _restartInterval = new Subject<void>();
    private readonly _stopInterval = new Subject<void>();

    private listenSubscription: Subscription;

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
        private debug: Debugger,
        private gpsUtils: GpsUtils
    ) {}

    ngOnInit(): void {
        this.loadAsync(this.isFirstLoad);
        this.backgroundLocationListener();
    }

    ngOnDestroy(): void {
        this.closeIdleIntervalObservable();
        disposeSubscription(this.listenSubscription);
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

    async onLogoutClicked() {
        const confirmation = await this.toasts.presentAlertAsync(
            'Confirmación',
            'Está por cerrar su sesión',
            '¿Desea salir de su sesión?',
            'yes'
        );

        if (!confirmation) {
            return;
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Cerrando Sesión'
        });
        await loadingDialog.present();
        try {
            await this.api.auth.signOut();
        } catch (error) {
            await loadingDialog.dismiss();
            this.toasts.presentToastAsync(error, 'danger');
            return;
        }
        await loadingDialog.dismiss();
    }

    onRefreshClicked() {
        this.loadAsync(false);
    }

    async onLocationClicked() {
        await this.gpsUtils.saveMyLocationAsync();
    }

    onScanClicked() {
        this.nav.mainContainer.scanner.go();
    }

    onClickScanQRCode() {
        this.viewCode = !this.viewCode;
    }

    onUserProfileClicked() {
        this.nav.user(this.user.uid).go();
    }

    async onQrSrcObtained(qrSrc: Blob) {
        if (!qrSrc) {
            throw 'No source provided for upload to storage!';
        }

        if (qrSrc.size < 1) {
            throw 'No blob content!';
        }

        if (this.user.qrCodeUrl.includes('firebasestorage')) {
            this.debug.info('Already uploaded to storage!');
            return;
        }

        const loadingDialog = await this.loadingController.create({
            message: 'Generando el código QR'
        });

        await loadingDialog.present();

        try {
            this.debug.info('qrSrc:', qrSrc);
            const fileName = formatToBlobName(this.user.uid);
            this.debug.info('waiting...');
            const resourceUrl = await this.api.storage.uploadBlobWithProgressAsync(
                qrSrc,
                fileName
            );

            this.debug.info('resourceUrl:', resourceUrl);
            if (!resourceUrl) {
                throw 'Could not get resourceUrl';
            }
            this.debug.info('resourceUrl:', resourceUrl);
            this.user.qrCodeUrl = resourceUrl;
            await this.api.users.updateAsync(this.user.uid, this.user);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
        }

        await loadingDialog.dismiss();
    }

    async loadAsync(checkCache: boolean = true) {
        this.debug.info('Loading user profile...');

        this.loading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        this.debug.info('checkCache:', checkCache);

        const authUser = await this.api.auth.currentUser;
        this.debug.info('user:', authUser);

        if (!authUser) {
            this.debug.info('User not found!');
            await loadingDialog.dismiss();
            await this.throwToastAndSignoutAsync();
            return;
        }

        this.debug.info('Getting user...');
        this.user = await this.api.users.getByUidOrDefaultAsync(authUser.uid);
        this.debug.info('this.user:', this.user);
        this.context.qrImgSrc.set(this.user.qrCodeUrl);
        await this.updateUserLocationsAsync();
        await loadingDialog.dismiss();

        // We update state so we don't query
        // remote cloud every time.
        this.isFirstLoad = true;
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
                    this.debug.info('Saving location from background!');
                    await this.gpsUtils.saveMyLocationAsync();
                });
        }
    }

    private async updateUserLocationsAsync() {
        try {
            const locations = await this.api.userLocation.getUsersLocationsAsync(
                false,
                false,
                this.user.uid
            );
            this.debug.info('locations:', locations);

            userLocations.set(locations.length);
            this.debug.info('userLocations.set');
        } catch (error) {
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }
    }

    private async throwToastAndSignoutAsync() {
        let message = 'No se pudo autenticar. Por favor vuelva a iniciar sesión';
        await this.toasts.presentToastAsync(message, 'danger');
        await this.api.auth.signOut();
        this.nav.login.go();
    }
}
