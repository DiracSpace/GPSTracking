import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    ActionSheetController,
    ActionSheetOptions,
    IonBackButtonDelegate,
    LoadingController,
    NavController
} from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Logger, LogLevel } from 'src/app/logger';
import { Navigation } from 'src/app/navigation';
import { AlertUtils } from 'src/app/services';
import { ContextService } from 'src/app/services/context.service';
import { PhotoService } from 'src/app/services/photo.service';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { User, UserAddress } from 'src/app/views';
import { getAddressDescription } from 'src/app/views/User/UserAddress';
import { Assets } from 'src/assets';
import { UserProfileCardItems } from './CardItems';

const logger = new Logger({
    source: 'UserPage',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-user',
    templateUrl: './user.page.html',
    styleUrls: ['./user.page.scss']
})
export class UserPage implements OnInit {
    @ViewChild(IonBackButtonDelegate, { static: false })
    backButton: IonBackButtonDelegate;

    userProfileCardItems = UserProfileCardItems;
    actionSheetOptions: ActionSheetOptions = {
        buttons: [
            {
                text: 'Eliminar la foto',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    console.log('Eliminar la foto de perfil!');
                }
            },
            {
                text: 'Tomarse una foto',
                icon: 'camera-outline',
                handler: async () => {
                    await this.photoService.takePictureAsync();
                }
            },
            {
                text: 'Elegir una foto',
                icon: 'images-outline',
                handler: () => {
                    this.context.openCloseProfileSelectorModal();
                }
            },
            {
                text: 'Cancelar',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                    console.log('Cancelar!');
                }
            }
        ]
    };

    loading = false;
    user: User;

    constructor(
        private actionSheetController: ActionSheetController,
        private loadingController: LoadingController,
        private activatedRoute: ActivatedRoute,
        private photoService: PhotoService,
        private context: ContextService,
        private api: ApiService,
        private navController: NavController,
        private debug: Debugger,
        private nav: Navigation,
        private alerts: AlertUtils
    ) {}

    ngOnInit() {
        if (this.userId) {
            this.tryLoadUserAsync();
        }
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
        this.debug.info('navigatedUsingQrCodeScan', this.navigatedUsingQrCodeScan);

        if (!this.navigatedUsingQrCodeScan) {
            this.navController.pop();
            return;
        }

        // TODO Figure out how to pop 2 times. Using .pop() 2 times does not work (that would've been too easy).
        // this.navController.pop();
        // this.navController.pop();

        // TODO As a solution for now, take user to home page, navigating backwards (or maybe this is the solution we want).
        const route = this.nav.mainContainer.home.path;
        this.navController.navigateBack(route);
    };

    /* #region getters */
    get invalidContent() {
        return !this.userId || !this.user;
    }

    get invalidContentMessage(): string {
        if (!this.userId) {
            return 'La URL es incorrecta';
        }

        if (!this.user) {
            return 'No se encontró al usuario';
        }

        return 'Desconocido';
    }

    get userId(): string | undefined {
        const userId = this.activatedRoute.snapshot.params.id;
        return userId;
    }

    get userBannerImg() {
        if (!this.user.bannerUrl) {
            return Assets.banner;
        }

        return this.user.bannerUrl;
    }

    get userAvatarImg() {
        if (!this.user.photoUrl) {
            return Assets.avatar;
        }

        return this.user.photoUrl;
    }

    get fullName(): string {
        const parts: string[] = [];

        if (this.user.firstName) {
            parts.push(this.user.firstName);
        }

        if (this.user.middleName) {
            parts.push(this.user.middleName);
        }

        if (this.user.lastNameFather) {
            parts.push(this.user.lastNameFather);
        }

        if (this.user.lastNameMother) {
            parts.push(this.user.lastNameMother);
        }

        return parts.join(' ');
    }

    get hasAtLeastOneAddress() {
        if (this.user.addresses == undefined || this.user.addresses == null) {
            return false;
        }

        return this.user.addresses.length > 0;
    }

    /**
     * Checks if there is a query param with the "fromScan" key.
     * It's important to know because if user tries to navigate backwards,
     * we need to "pop" 2 times in the navigation stack, otherwise
     * an issue with qr code scanner will be encountered.
     */
    get navigatedUsingQrCodeScan(): boolean {
        const param = this.activatedRoute.snapshot.queryParams.fromScan;
        return param == 'true';
    }

    /* #endregion */

    getAddressDescription(address: UserAddress) {
        return getAddressDescription(address);
    }

    async onClickOpenActions() {
        const actionSheet = await this.actionSheetController.create(
            this.actionSheetOptions
        );
        await actionSheet.present();
        const { role, data } = await actionSheet.onDidDismiss();
        logger.log('role:', role);
        logger.log('data:', data);
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
            this.user = await this.api.users.getByUidOrDefaultAsync(this.userId);
        } catch (error) {
            await loadingDialog.dismiss();
            throw error;
        }

        if (!this.user) {
            await loadingDialog.dismiss();
            throw new Error('No user was found!');
        }

        const photoName = `ProfilePicture_${this.user.uid}_`;
        this.context.photoName.set(photoName);

        logger.log('this.context.photoName.get():', this.context.photoName.get());
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
        this.loading = false;
    }

    private async initUserCardInformation() {
        if (this.hasAtLeastOneAddress) {
        }
    }
}
