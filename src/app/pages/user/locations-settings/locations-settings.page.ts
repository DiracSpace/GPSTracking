import { Component, OnInit } from '@angular/core';
import { AlertUtils, GpsUtils, Popups } from 'src/app/services';
import { ApiService } from 'src/app/api';
import { User } from 'src/app/views';
import { wait } from 'src/app/utils/time';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { ArgumentNullError } from 'src/app/errors';
import { DDMMYYYYHHmmssLong } from 'src/app/utils/dates';
import { limit, orderBy, where } from '@angular/fire/firestore';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Geolocation } from 'src/app/api/geolocations/Geolocation';
import { NavController } from '@ionic/angular';
import { Navigation } from 'src/app/navigation';
import { ActivatedRoute } from '@angular/router';

const LocationsLimit = 10; // TODO Add this to environment or user preference?

@Component({
    selector: 'app-locations-settings',
    templateUrl: './locations-settings.page.html',
    styleUrls: ['./locations-settings.page.scss']
})
export class LocationsSettingsPage implements OnInit {
    geolocations: Geolocation[] = [];
    user = new User();
    loading = false;
    canEdit = true;

    constructor(
        private activatedRoute: ActivatedRoute,
        private navController: NavController,
        private gpsUtils: GpsUtils,
        private alerts: AlertUtils,
        private nav: Navigation,
        private debug: Debugger,
        private api: ApiService,
        private popups: Popups
    ) {}

    ngOnInit() {
        this.tryLoadAsync();
    }

    get userId(): string | undefined {
        return this.activatedRoute.snapshot.params.id;
    }

    get name() {
        if (!this.user.firstName || !this.user.lastNameFather) {
            return 'Ubicaciones del Usuario buscado';
        }

        return `Usuario: ${this.user.firstName} ${this.user.lastNameFather}`;
    }

    get hasLocations(): boolean {
        return this.geolocations.length > 0;
    }

    get lastLocationsCount(): number {
        if (!this.geolocations) {
            return 0;
        }

        return Math.min(LocationsLimit, this.geolocations.length);
    }

    onRefreshClicked() {
        this.loadAsync();
    }

    async onClickLoadLocationDataAsync(location: Geolocation) {
        if (!location._isAccordianHidden) {
            location._isAccordianHidden = true;
            return;
        }
        location._isLoadingLocationData = true;
        await wait(500);
        location._isAccordianHidden = false;
        location._isLoadingLocationData = false;
    }

    async onLocationClicked() {
        this.popups.alerts
            .confirmAsync('¿Quieres guardar tu ubicacion actual?', {
                confirmText: 'Si',
                cancelText: 'No'
            })
            .then(async () => {
                await this.gpsUtils.saveMyLocationAsync();
                await this.loadAsync();
            })
            .catch(() => {
                // ignore
            });
    }

    getLocationDisplayName(geolocation: Geolocation): string {
        const caller = 'getLocationDisplayName';
        ArgumentNullError.throwIfNull(geolocation, 'geolocation', caller);

        if (!geolocation.displayName) {
            return `${geolocation.latitude} ${geolocation.longitude}`;
        }

        return geolocation.displayName;
    }

    getDateString(date: string | Date) {
        return DDMMYYYYHHmmssLong(date, { lang: 'es' });
    }

    private async tryLoadAsync() {
        try {
            await this.loadAsync();
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            await this.alerts.error('Usuario inválido', errorDetails);
            this.navController.pop();
        }
    }

    private async loadAsync() {
        this.loading = true;
        const loadingDialog = await this.popups.loaders.showAsync('Cargando...');

        try {
            const authUser = await this.api.auth.getCurrentUserAsync();

            if (this.userId && authUser.uid != this.userId) {
                this.canEdit = false;
            }

            const uid = this.userId ?? authUser.uid;
            this.geolocations = await this.api.geolocations.getAsync({
                query: [
                    where('userId', '==', uid),
                    orderBy('dateRegistered', 'desc'),
                    limit(LocationsLimit)
                ]
            });
            this.geolocations.forEach((location) => (location._isAccordianHidden = true));
            console.log('geolocations', this.geolocations);
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            this.debug.error(errorDetails.toString());
            this.popups.toasts.error(errorDetails.toString());
            return;
        }

        await loadingDialog.dismiss();
        this.loading = false;
    }
}
