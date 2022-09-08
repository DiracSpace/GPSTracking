import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Logger, LogLevel } from 'src/app/logger';
import { ToastsService } from 'src/app/services';
import { ApiService } from 'src/app/api';
import { Location } from 'src/app/views';
import { Navigation } from 'src/app/navigation';

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
    userLocations: Location[] = [];
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
        private nav: Navigation,
        private api: ApiService
    ) {}

    ngOnInit() {
        this.loadAsync();
    }

    getAccordianShortAddress(city: string, state: string) {
        return `${city}, ${state}`;
    }

    onHomeClicked() {
        this.nav.mainContainer.home.go();
    }

    deleteLocationClicked(location: Location) {
        logger.log("location:", location);
    }

    async loadAsync(checkCache: boolean = true) {
        this.isLoading = true;
        const loadingDialog = await this.loadingController.create({
            message: 'Cargando tu perfíl'
        });
        await loadingDialog.present();

        try {
            const { uid } = await this.api.auth.currentUser;
            this.userLocations = await this.api.location.getAllLocationsByUserIdAsync(
                uid,
                checkCache
            );
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
        }

        await loadingDialog.dismiss();
        this.isLoading = false;
    }
}
