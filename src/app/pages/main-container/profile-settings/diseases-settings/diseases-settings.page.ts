import { User, UserDiseaseDetail } from 'src/app/views';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonBackButtonDelegate, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { Logger, LogLevel } from 'src/app/logger';
import { guid } from 'src/app/utils';
import { ArgumentNullError, NotImplementedError } from 'src/app/errors';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { Navigation } from 'src/app/navigation';
import { AlertUtils } from 'src/app/services';
import { ActivatedRoute } from '@angular/router';

const logger = new Logger({
    source: 'DiseasesSettingsPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-diseases-settings',
    templateUrl: './diseases-settings.page.html',
    styleUrls: ['./diseases-settings.page.scss']
})
export class DiseasesSettingsPage implements OnInit {
    @ViewChild(IonBackButtonDelegate, { static: false })
    backButton: IonBackButtonDelegate;

    diseaseInput = new UserDiseaseDetail();
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
            return 'Enfermedades del Usuario buscado';
        }

        return `Usuario: ${this.user.firstName} ${this.user.lastNameFather}`;
    }

    get diseases(): UserDiseaseDetail[] {
        if (this.user.diseases == undefined || this.user.diseases == null) {
            return [];
        }

        return this.user.diseases;
    }

    onDiseaseEnter() {
        if (!this.diseaseInput) {
            return;
        }

        this.diseases.push(this.diseaseInput);
    }

    onAddClicked() {
        logger.log('Adding new!');
        const disease = new UserDiseaseDetail();
        disease.id = guid();
        this.user.diseases.push(disease);
    }

    async onDeleteClicked(disease: UserDiseaseDetail) {
        if (!disease) {
            return;
        }

        const caller = 'onDeleteClicked';
        const index = this.diseases.indexOf(disease);

        if (index == -1) {
            let message = 'Could not find disease to delete';
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
            this.diseases.splice(index, 1);

            const loadingDialog = await this.loadingController.create({
                message: 'Eliminando...'
            });
            await loadingDialog.present();

            try {
                logger.log('disease:', disease);
                await this.api.users.removeArrayElementAsync(
                    'diseases',
                    this.user.uid,
                    disease
                );
            } catch (error) {
                await loadingDialog.dismiss();
                await this.toasts.presentToastAsync(error, 'danger');
                return;
            }

            await loadingDialog.dismiss();
        }
    }

    async onSaveClicked(disease: UserDiseaseDetail) {
        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });
        await loadingDialog.present();

        try {
            logger.log('disease:', disease);
            await this.api.users.updateArrayAsync('diseases', this.user.uid, disease);
        } catch (error) {
            logger.log('error:', error);
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
        await this.toasts.presentToastAsync('¡Se guardó existosamente!');
    }

    getDiseaseDescription(disease: UserDiseaseDetail): string {
        const caller = 'getDiseaseDescription';
        ArgumentNullError.throwIfNull(disease, 'disease', caller);

        if (!disease.name) {
            return 'Enfermedad';
        }

        return disease.name;
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
