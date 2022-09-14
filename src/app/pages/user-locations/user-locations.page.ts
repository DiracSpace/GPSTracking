import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Logger, LogLevel } from 'src/app/logger';
import { ToastsService } from 'src/app/services';
import { ApiService } from 'src/app/api';
import { Location, UserLocation } from 'src/app/views';
import { formatToDocumentName } from 'src/app/views/Location/Location';

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
        location._isLoadingLocationData = true;
        location._location = await this.getUserLocationData(location.geohash);
        location._isAccordianHidden = !location._isAccordianHidden;
        location._isLoadingLocationData = false;
    }

    // TODO: review this function based on change in service
    private async getUserLocationData(geohash: string): Promise<Location> {
        try {
            logger.log("geohash:", geohash);
            const location = await this.api.location.getByGeohashOrDefaultAsync(geohash);
            logger.log('location:', location);
            return location;
        } catch (error) {
            await this.toasts.presentToastAsync(error, 'danger');
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
