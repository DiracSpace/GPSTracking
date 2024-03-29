import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ActionSheetController,
    ActionSheetOptions,
    IonBackButtonDelegate,
    LoadingController,
    NavController,
    Platform
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/api';
import { CardItemStatusTypes } from 'src/app/core/components/card-item/card-item.component';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { RequiredPropError } from 'src/app/errors';
import { Logger, LogLevel } from 'src/app/logger';
import { Navigation } from 'src/app/navigation';
import { AlertUtils, ToastsService } from 'src/app/services';
import { ContextService } from 'src/app/services/context.service';
import { PhotoService } from 'src/app/services/photo.service';
import { disposeSubscription } from 'src/app/utils/angular';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { User } from 'src/app/views';
import { getUserAddressDescription } from 'src/app/views/User/UserAddress';
import { ASSETS } from 'src/assets';
import {
    UserAddressInformationCardItem,
    UserAlergyInformationCardItem,
    UserBasicInformationCardItem,
    UserDiseaseInformationCardItem,
    UserLocationsInformationCardItem,
    UserPhoneNumberInformationCardItem,
    UserProfileCardItems
} from './CardItems';

const logger = new Logger({
    source: 'UserPage',
    level: LogLevel.Off
});

@Component({
    selector: 'app-user',
    templateUrl: './user.page.html',
    styleUrls: ['./user.page.scss']
})
export class UserPage implements OnInit, OnDestroy {
    @ViewChild(IonBackButtonDelegate, { static: false })
    backButton: IonBackButtonDelegate;

    userProfileCardItems = UserProfileCardItems;
    actionSheetOptions: ActionSheetOptions = {
        buttons: [
            {
                text: 'Eliminar la foto',
                role: 'destructive',
                icon: 'trash',
                handler: async () => {
                    await this.api.storage.deleteFromStorageAsync(
                        this.context.selectedProfilePicture.get()
                    );
                    this.context.selectedProfilePicture.set(null);
                    await this.updateUserProfilePhotoUrlAsync(true);
                    this.actionSheet?.dismiss();
                }
            },
            {
                text: 'Tomarse una foto',
                icon: 'camera-outline',
                handler: async () => {
                    try {
                        await this.photoService.loadSaved(this.user.uid);
                        await this.photoService.takePictureAsync();
                    } catch (error) {
                        await this.toasts.error(error);
                    }
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

    isReadonly = false;
    loading = false;
    user: User;

    private listenForProfilePictureSubscription: Subscription;
    private actionSheet: HTMLIonActionSheetElement;
    private platformBackButtonSubs: Subscription;

    constructor(
        private actionSheetController: ActionSheetController,
        private loadingController: LoadingController,
        private activatedRoute: ActivatedRoute,
        private navController: NavController,
        private photoService: PhotoService,
        private context: ContextService,
        private toasts: ToastsService,
        private alerts: AlertUtils,
        private api: ApiService,
        private debug: Debugger,
        private router: Router,
        private nav: Navigation,
        private platform: Platform
    ) {}

    ngOnInit() {
        if (!this.api.auth.isAuthenticated.get()) {
            this.trySignInUser();
        }

        if (this.userId) {
            this.tryLoadUserAsync();
        }

        this.listenForProfilePictureSubscription = this.context.selectedProfilePicture
            .watch()
            .subscribe(async () => {
                this.actionSheet?.dismiss();
                await this.updateUserProfilePhotoUrlAsync();
            });
    }

    ionViewDidEnter() {
        this.debug.info('UserPage.ionViewDidEnter');
        this.setBackButtonClicks();
    }

    ionViewWillLeave(): void {
        this.debug.info('UserPage.ionViewWillLeave');
        this.disposeResources();
    }

    ionViewDidLeave(): void {
        this.debug.info('UserPage.ionViewDidLeave');
        this.disposeResources();
    }

    ngOnDestroy(): void {
        this.debug.info('UserPage.ngOnDestroy');
        this.disposeResources();
    }

    private disposeResources() {
        this.debug.info('disposeResources');
        disposeSubscription(this.listenForProfilePictureSubscription);
        disposeSubscription(this.platformBackButtonSubs);
    }

    /**
     * Set handlers to go directly to home page if either comming from home page or a qr code scan.
     *
     * In the case if comming from a qr code scan, this will prevent a bug where the screen goes
     * black if the user has navigated to this page via qr scanner.
     */
    private setBackButtonClicks() {
        this.debug.info('setBackButtonClicks');

        this.backButton.onClick = () => {
            this.debug.info('this.backButton.onClick');
            this.goBackToHomePage();
        };

        // TODO Add constant for priority argument?
        this.platformBackButtonSubs = this.platform.backButton.subscribeWithPriority(
            10,
            () => {
                this.debug.info('platform.backButton');
                this.goBackToHomePage();
            }
        );

        this.debug.info('observers', this.platform.backButton.observers);
    }

    private goBackToHomePage() {
        this.debug.info('goBackToHomePage');
        const route = this.nav.mainContainer.home.path;
        this.navController.navigateBack(route);
    }

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

    /* #region cardItemStatuses */
    get userBasicInformationStatus(): CardItemStatusTypes {
        const basicInformationIsIncomplete =
            !this.user.firstName ||
            !this.user.middleName ||
            !this.user.lastNameFather ||
            !this.user.lastNameMother;

        return basicInformationIsIncomplete ? 'incompleto' : 'completado';
    }

    get userAddressInformationStatus(): CardItemStatusTypes {
        const addressInformationIsIncomplete =
            !this.user.addresses ||
            this.user.addresses.length == 0 ||
            !this.defaultAddress;
        return addressInformationIsIncomplete ? 'incompleto' : 'completado';
    }

    get userPhoneNumberInformationStatus(): CardItemStatusTypes {
        const phoneNumberInformationIsIncomplete =
            !this.user.phoneNumbers ||
            this.user.phoneNumbers.length == 0 ||
            !this.defaultPhoneNumber;
        return phoneNumberInformationIsIncomplete ? 'incompleto' : 'completado';
    }

    get userDiseaseInformationStatus(): CardItemStatusTypes {
        const diseaseInformationIsIncomplete =
            !this.user.diseases || this.user.diseases.length == 0;
        return diseaseInformationIsIncomplete ? 'incompleto' : 'completado';
    }

    get userAlergyInformationStatus(): CardItemStatusTypes {
        const alergyInformationIsIncomplete =
            !this.user.alergies || this.user.alergies.length == 0;
        return alergyInformationIsIncomplete ? 'incompleto' : 'completado';
    }
    /* #endregion */

    get userId(): string | undefined {
        const userId = this.activatedRoute.snapshot.params.id;
        return userId;
    }

    get userAvatarImg() {
        if (!this.context.selectedProfilePicture.get()) {
            // logger.log('No profile picture!');
            return ASSETS.avatar;
        }

        return this.context.selectedProfilePicture.get();
    }

    get displayName(): string {
        if (this.user.username) {
            return this.user.username;
        }

        if (!this.user.firstName && !this.user.lastNameFather) {
            return this.user.email;
        }

        const display = `${this.user.firstName} ${this.user.lastNameFather}`;
        return display ?? 'Usuario';
    }

    get defaultAddress() {
        return this.user.addresses.find((x) => x.isDefault) ?? null;
    }

    get defaultPhoneNumber() {
        return this.user.phoneNumbers.find((x) => x.isDefault) ?? null;
    }

    // We use slice to not alter original array
    get diseaseNames() {
        return (
            this.user.diseases
                .slice(0, 3)
                .map((d) => d.name)
                .join(', ') ?? null
        );
    }

    // We use slice to not alter original array
    get alergyNames() {
        return (
            this.user.alergies
                .slice(0, 3)
                .map((a) => a.name)
                .join(', ') ?? null
        );
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

    onUserProfileImgError() {
        logger.log('Error getting users picture!');
        this.context.selectedProfilePicture.set(ASSETS.avatar);
    }

    async onClickOpenActions() {
        this.actionSheet = await this.actionSheetController.create(
            this.actionSheetOptions
        );
        await this.actionSheet.present();
        const { role, data } = await this.actionSheet.onDidDismiss();
        logger.log('role:', role);
        logger.log('data:', data);
    }

    private async updateUserProfilePhotoUrlAsync(allowNull: boolean = false) {
        const profilePictureUrl = this.context.selectedProfilePicture.get();
        logger.log('profilePictureUrl:', profilePictureUrl);

        if (!profilePictureUrl && !allowNull) {
            return;
        }

        if (!allowNull && profilePictureUrl.includes('assets')) {
            logger.log('Includes assets!');
            return;
        }

        try {
            logger.log('profilePictureUrl:', profilePictureUrl);
            this.user.photoUrl = profilePictureUrl;

            logger.log('this.user:', this.user);
            await this.api.users.updateAsync(this.user.uid, this.user);
            logger.log('updated!');
        } catch (error) {
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        await this.toasts.presentToastAsync('¡Se actualizó con éxito!');
    }

    private async trySignInUser() {
        try {
            await this.api.auth.signInAnonymously();
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            await this.alerts.error('Usuario Inválido', errorDetails);
            this.goBackToHomePage();
        }
    }

    private async tryLoadUserAsync() {
        try {
            await this.loadUserAsync();
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            await this.alerts.error('Usuario inválido', errorDetails);
            this.goBackToHomePage();
        }
    }

    private async loadUserAsync() {
        this.loading = true;

        const loadingDialog = await this.loadingController.create({
            message: 'Cargando datos del usuario'
        });

        await loadingDialog.present();

        try {
            const authUser = await this.api.auth.getCurrentUserAsync();
            if (authUser.uid != this.userId) {
                this.isReadonly = true;
            }

            this.user = await this.api.users.getByUidOrDefaultAsync(this.userId, false);
        } catch (error) {
            await loadingDialog.dismiss();
            throw error;
        }

        if (!this.user) {
            await loadingDialog.dismiss();
            throw new Error('No user was found!');
        }

        const photoName = `ProfilePicture_${this.user.uid}_`;
        this.context.selectedProfilePicture.set(this.user.photoUrl ?? null);
        this.context.photoName.set(photoName);

        logger.log('this.context.photoName.get():', this.context.photoName.get());
        logger.log('this.user:', this.user);

        this.initCardItemRoutes();

        await loadingDialog.dismiss();
        this.loading = false;
    }

    private initCardItemRoutes() {
        const caller = 'initCardItemRoutes';

        UserLocationsInformationCardItem.action = () => {
            RequiredPropError.throwIfNull(this.user, 'user', caller);
            RequiredPropError.throwIfNull(this.user.uid, 'user.uid', caller);
            this.nav.user(this.user.uid).locations.go();
        };

        UserBasicInformationCardItem.status = this.userBasicInformationStatus;

        if (this.user.firstName && this.user.lastNameFather && this.user.email) {
            UserBasicInformationCardItem.secondaryTitle = `${this.user.firstName} ${this.user.lastNameFather}, ${this.user.email}`;
        }

        UserBasicInformationCardItem.action = () => {
            this.nav.user(this.user.uid).names.go();
        };

        UserAddressInformationCardItem.status = this.userAddressInformationStatus;

        if (this.defaultAddress != null) {
            UserAddressInformationCardItem.secondaryTitle = getUserAddressDescription(
                this.defaultAddress
            );
        }

        UserAddressInformationCardItem.action = () => {
            this.nav.user(this.user.uid).addresses.go();
        };

        UserPhoneNumberInformationCardItem.status = this.userPhoneNumberInformationStatus;
        if (this.defaultPhoneNumber != null) {
            UserPhoneNumberInformationCardItem.secondaryTitle =
                this.defaultPhoneNumber.number;
        }
        UserPhoneNumberInformationCardItem.action = () => {
            this.nav.user(this.user.uid).phoneNumbers.go();
        };

        UserDiseaseInformationCardItem.status = this.userDiseaseInformationStatus;
        UserDiseaseInformationCardItem.secondaryTitle = this.diseaseNames;
        UserDiseaseInformationCardItem.action = () => {
            this.nav.user(this.user.uid).diseases.go();
        };

        UserAlergyInformationCardItem.status = this.userAlergyInformationStatus;
        UserAlergyInformationCardItem.secondaryTitle = this.alergyNames;
        UserAlergyInformationCardItem.action = () => {
            this.nav.user(this.user.uid).alergies.go();
        };
    }
}
