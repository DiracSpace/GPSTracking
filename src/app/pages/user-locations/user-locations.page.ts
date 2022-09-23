import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Logger, LogLevel } from 'src/app/logger';
import { ToastsService } from 'src/app/services';
import { ApiService } from 'src/app/api';
import { Location, UserLocation } from 'src/app/views';
import { getGeoHashString } from 'src/app/views/Location/Location';
import { wait } from 'src/app/utils/time';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { ArgumentNullError } from 'src/app/errors';
import { DDMMYYYYHHmmssLong } from 'src/app/utils/dates';

const logger = new Logger({
    source: 'UserLocationsPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-user-locations',
    templateUrl: './user-locations.page.html',
    styleUrls: ['./user-locations.page.scss']
})
export class UserLocationsPage implements OnInit {
    userLocations: UserLocation[] = [];
    recentLocations: Location[] = [];
    isLoading: boolean = false;

    slideOpts = {
        effect: 'coverflow',
        speed: 100,
        // initialSlide: 1
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflow: {
            rotate: 45,
            stretch: 0,
            depth: 80,
            modifier: 1,
            slideShadows: true
        }
    };

    constructor(
        private loadingController: LoadingController,
        private toasts: ToastsService,
        private api: ApiService
    ) {}

    ngOnInit() {
        this.loadAsync();
    }

    get hasUserLocationContent() {
        return this.userLocations.length > 0;
    }

    get hasUserRecentLocationContent() {
        return this.recentLocations.length > 0;
    }

    async onClickLoadLocationDataAsync(location: UserLocation) {
        console.log('location', location);
        if (!location._isAccordianHidden) {
            location._isAccordianHidden = true;
            return;
        }

        location._isLoadingLocationData = true;

        // Show loading animation. This prevents a weird ugly UI bug when expanding accordion
        await wait(500);

        // Only loading location once
        if (!location._location) {
            location._location = await this.getUserLocationData(location.geohash);
        }

        location._isAccordianHidden = false;
        location._isLoadingLocationData = false;
    }

    getLocationDisplayName(userLocation: UserLocation): string {
        const caller = 'getLocationDisplayName';
        ArgumentNullError.throwIfNull(userLocation, 'location', caller);

        if (!userLocation._location) {
            return userLocation.shortDisplayName;
        }

        if (!userLocation._location.displayName) {
            return `${userLocation._location.latitude} ${userLocation._location.longitude}`;
        }

        return userLocation._location.displayName;
    }

    getDateString(date: string | Date) {
        return DDMMYYYYHHmmssLong(date, { lang: 'es' });
    }

    // TODO: review this function based on change in service
    private async getUserLocationData(geohash: string): Promise<Location> {
        try {
            const location = await this.api.location.getByGeohashOrDefaultAsync(geohash);

            if (location) {
                return location;
            }

            throw new Error('Could not find location');
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            await this.toasts.presentToastAsync(errorDetails.toString(), 'danger');
            throw errorDetails;
        }
    }

    async deleteLocationClicked(location: UserLocation) {
        if (!location) {
            return;
        }

        let message: string;
        const index = this.userLocations.indexOf(location);

        if (index == -1) {
            message = 'No se pudo eliminar la ubicación';
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
            // TODO: remove binding between user and location
            this.userLocations.splice(index, 1);
        }
    }

    private async deleteLocationAsync(entityId: string) {
        const loadingDialog = await this.loadingController.create({
            message: 'Eliminando...'
        });
        await loadingDialog.present();

        try {
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
        } finally {
            await loadingDialog.dismiss();
        }
    }

    async loadAsync(checkCache: boolean = true) {
        this.isLoading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        try {
            const { uid } = await this.api.auth.currentUser;
            this.userLocations = await this.api.userLocation.getUsersLocationsAsync(
                checkCache,
                false,
                uid
            );
            logger.log('this.userLocations:', this.userLocations);
            this.userLocations.forEach(
                (location) => (location._isAccordianHidden = true)
            );
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
        }

        await loadingDialog.dismiss();
        this.isLoading = false;
    }
}
