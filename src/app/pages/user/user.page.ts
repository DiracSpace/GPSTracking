import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    ActionSheetController,
    ActionSheetOptions,
    IonBackButtonDelegate,
    LoadingController,
    NavController
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/api';
import {
    CardItemIdTypes,
    CardItemStatusTypes
} from 'src/app/core/components/card-item/card-item.component';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Logger, LogLevel } from 'src/app/logger';
import { Navigation } from 'src/app/navigation';
import { AlertUtils, ToastsService } from 'src/app/services';
import { ContextService } from 'src/app/services/context.service';
import { PhotoService } from 'src/app/services/photo.service';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { User, UserAddress } from 'src/app/views';
import { getUserAddressDescription } from 'src/app/views/User/UserAddress';
import { Assets } from 'src/assets';
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
    level: LogLevel.Debug
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
                    this.actionSheet.dismiss();
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

    loading = false;
    user: User;

    listenForProfilePictureSubscription: Subscription;
    closeListenForProfilePictureSubscription() {
        if (this.listenForProfilePictureSubscription) {
            this.listenForProfilePictureSubscription.unsubscribe();
            this.listenForProfilePictureSubscription = null;
        }
    }

    private actionSheet: HTMLIonActionSheetElement;

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
        private nav: Navigation
    ) {}

    ngOnInit() {
        if (this.userId) {
            this.tryLoadUserAsync();
        }

        this.listenForProfilePictureSubscription = this.context.selectedProfilePicture
            .watch()
            .subscribe(async () => {
                this.actionSheet.dismiss();
                await this.updateUserProfilePhotoUrlAsync();
            });
    }

    ngOnDestroy(): void {
        this.closeListenForProfilePictureSubscription();
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

    /* #region cardItemStatuses */
    get userBasicInformationStatus(): CardItemStatusTypes {
        let basicInformationIsIncomplete =
            !this.user.firstName ||
            !this.user.middleName ||
            !this.user.lastNameFather ||
            !this.user.lastNameMother;

        return basicInformationIsIncomplete ? 'incompleto' : 'completado';
    }

    get userAddressInformationStatus(): CardItemStatusTypes {
        let addressInformationIsIncomplete =
            !this.user.addresses || this.user.addresses.length == 0;
        return addressInformationIsIncomplete ? 'incompleto' : 'completado';
    }

    get userPhoneNumberInformationStatus(): CardItemStatusTypes {
        let phoneNumberInformationIsIncomplete =
            !this.user.phoneNumbers || this.user.phoneNumbers.length == 0;
        return phoneNumberInformationIsIncomplete ? 'incompleto' : 'completado';
    }

    get userDiseaseInformationStatus(): CardItemStatusTypes {
        let diseaseInformationIsIncomplete =
            !this.user.diseases || this.user.diseases.length == 0;
        return diseaseInformationIsIncomplete ? 'incompleto' : 'completado';
    }

    get userAlergyInformationStatus(): CardItemStatusTypes {
        let alergyInformationIsIncomplete =
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
            return Assets.avatar;
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

        let display = `${this.user.firstName} ${this.user.lastNameFather}`;
        return display ?? 'Usuario';
    }

    get defaultAddress() {
        if (!this.user.addresses || this.user.addresses) {
            return null;
        }

        return this.user.addresses.find((x) => x.isDefault);
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
        this.context.selectedProfilePicture.set(Assets.avatar);
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
        let profilePictureUrl = this.context.selectedProfilePicture.get();
        logger.log('profilePictureUrl:', profilePictureUrl);

        if (!profilePictureUrl && !allowNull) {
            throw 'No existe una URL';
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

        this.initCardItemRoutes();

        logger.log('this.context.photoName.get():', this.context.photoName.get());
        logger.log('this.user:', this.user);

        await loadingDialog.dismiss();
        this.loading = false;
    }

    private initCardItemRoutes() {
        UserLocationsInformationCardItem.action = () => {
            if (!this.user || !this.user.uid) {
                throw 'Se require el UserId';
            }

            this.nav.locations(this.user.uid).go();
        };

        UserBasicInformationCardItem.status = this.userBasicInformationStatus;
        UserBasicInformationCardItem.secondaryTitle = `${this.user.firstName} ${this.user.lastNameFather}, ${this.user.email}`;
        UserBasicInformationCardItem.action = () => {
            this.nav.mainContainer.profileSettings.names.go();
        };

        UserAddressInformationCardItem.status = this.userAddressInformationStatus;
        if (this.defaultAddress != null) {
            UserAddressInformationCardItem.secondaryTitle = getUserAddressDescription(
                this.defaultAddress
            );
        }
        UserAddressInformationCardItem.action = () => {
            this.nav.mainContainer.profileSettings.addresses.go();
        };

        UserPhoneNumberInformationCardItem.status = this.userPhoneNumberInformationStatus;
        UserPhoneNumberInformationCardItem.action = () => {
            this.nav.mainContainer.profileSettings.phoneNumbers.go();
        };

        UserDiseaseInformationCardItem.status = this.userDiseaseInformationStatus;
        UserDiseaseInformationCardItem.action = () => {
            this.nav.mainContainer.profileSettings.diseases.go();
        };

        UserAlergyInformationCardItem.status = this.userAlergyInformationStatus;
        UserAlergyInformationCardItem.action = () => {
            this.nav.mainContainer.profileSettings.alergies.go();
        };
    }
}
