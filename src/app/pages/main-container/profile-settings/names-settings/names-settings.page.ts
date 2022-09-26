import { ApiService } from 'src/app/api/ApiService.service';
import { IonBackButtonDelegate, LoadingController, NavController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/views';
import { ToastsService } from 'src/app/services/popups/toasts.service';
import { ActivatedRoute } from '@angular/router';
import { Navigation } from 'src/app/navigation';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { AlertUtils } from 'src/app/services';
import { Logger, LogLevel } from 'src/app/logger';

const logger = new Logger({
    source: 'NamesSettingsPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-names-settings',
    templateUrl: './names-settings.page.html',
    styleUrls: ['./names-settings.page.scss']
})
export class NamesSettingsPage implements OnInit {
    @ViewChild(IonBackButtonDelegate, { static: false })
    backButton: IonBackButtonDelegate;

    canEdit = true;
    loading = false;
    user = new User();

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
            return 'Datos básicos del Usuario buscado';
        }

        return `Usuario: ${this.user.firstName} ${this.user.lastNameFather}`;
    }

    get email() {
        return this.user.email;
    }

    get firstName() {
        return this.user.firstName;
    }
    set firstName(value: string) {
        this.user.firstName = value;
    }

    get middleName() {
        return this.user.middleName;
    }
    set middleName(value: string) {
        this.user.middleName = value;
    }

    get lastNameFather() {
        return this.user.lastNameFather;
    }
    set lastNameFather(value: string) {
        this.user.lastNameFather = value;
    }

    get lastNameMother() {
        return this.user.lastNameMother;
    }
    set lastNameMother(value: string) {
        this.user.lastNameMother = value;
    }

    get username() {
        return this.user.username;
    }
    set username(value: string) {
        this.user.username = value;
    }

    async onSaveClicked() {
        console.log('user', this.user);

        const loadingDialog = await this.loadingController.create({
            message: 'Guardando...'
        });

        await loadingDialog.present();

        try {
            await this.api.users.updateAsync(this.user.uid, this.user);
        } catch (error) {
            await loadingDialog.dismiss();
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await loadingDialog.dismiss();
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
