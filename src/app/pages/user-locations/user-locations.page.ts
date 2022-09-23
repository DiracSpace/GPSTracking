import { Component, OnInit } from '@angular/core';
import { Logger, LogLevel } from 'src/app/logger';
import { GpsUtils, Popups } from 'src/app/services';
import { ApiService } from 'src/app/api';
import { UserLocation } from 'src/app/views';
import { wait } from 'src/app/utils/time';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { ArgumentNullError } from 'src/app/errors';
import { DDMMYYYYHHmmssLong } from 'src/app/utils/dates';
import { limit, orderBy, where } from '@angular/fire/firestore';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Geolocation } from 'src/app/api/geolocations/Geolocation';

const LocationsLimit = 10; // TODO Add this to environment or user preference?

@Component({
    selector: 'app-user-locations',
    templateUrl: './user-locations.page.html',
    styleUrls: ['./user-locations.page.scss']
})
export class UserLocationsPage implements OnInit {
    isLoading: boolean = false;
    geolocations: Geolocation[] = [];

    constructor(
        private api: ApiService,
        private popups: Popups,
        private debug: Debugger,
        private gpsUtils: GpsUtils
    ) {}

    ngOnInit() {
        this.loadAsync();
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

    private async loadAsync() {
        this.isLoading = true;
        const loadingDialog = await this.popups.loaders.showAsync('Cargando...');

        try {
            const user = await this.api.auth.getCurrentUserAsync();
            this.geolocations = await this.api.geolocations.getAsync({
                query: [
                    where('userId', '==', user.uid),
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
        } finally {
            await loadingDialog.dismiss();
            this.isLoading = false;
        }
    }
}
