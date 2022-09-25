import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContextService } from 'src/app/services/context.service';
import { Logger, LogLevel } from 'src/app/logger';
import { OverlayEventDetail } from '@ionic/core';
import { IonModal } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { PhotoService } from 'src/app/services/photo.service';
import { UserPhoto } from 'src/app/views';
import { StorageService } from 'src/app/api/storage/storage.service';
import { ToastsService } from 'src/app/services';
import { AuthService } from 'src/app/api/auth/auth.service';

const logger = new Logger({
    source: 'ProfileSelectorModalComponent',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-profile-selector-modal',
    templateUrl: './profile-selector-modal.component.html',
    styleUrls: ['./profile-selector-modal.component.scss']
})
export class ProfileSelectorModalComponent implements OnInit, OnDestroy {
    @ViewChild(IonModal) modal: IonModal;

    message =
        'This modal example uses triggers to automatically open a modal when the button is clicked.';
    name: string;

    private modalStateSubscription: Subscription;
    removeModalStateSubscription() {
        if (this.modalStateSubscription) {
            this.modalStateSubscription.unsubscribe();
            this.modalStateSubscription = null;
        }
    }

    isLoading: boolean = false;

    constructor(
        private storageService: StorageService,
        private photoService: PhotoService,
        private authService: AuthService,
        private context: ContextService,
        private toasts: ToastsService
    ) {}

    ngOnInit() {
        this.modalStateSubscription = this.context.profileSelectorModal
            .watch()
            .pipe(skip(1))
            .subscribe(async (value: boolean) => {
                logger.log('value:', value);
                logger.log('this.modal.isOpen:', this.modal.isOpen);
                if (value) {
                    let { uid } = await this.authService.currentUser;
                    await this.photoService.loadSaved(uid);
                }

                this.modal.isOpen = value;
            });
    }

    ngOnDestroy(): void {
        this.removeModalStateSubscription();
    }

    get hasContent() {
        return this.photoService.savedPhotosLoaded;
    }

    get photos() {
        return this.photoService.savedPhotos;
    }

    async onClickSet(photo: UserPhoto) {
        logger.log('photo:', photo);
        if (!photo) {
            return;
        }

        this.isLoading = true;

        try {
            logger.log('photo:', photo);
            let blob = await this.photoService.getBlob(photo.webViewPath);
            logger.log('blob:', blob);

            logger.log('uploading to firebase!');
            const resourceUrl = await this.storageService.uploadBlobWithProgressAsync(
                blob,
                photo.filepath
            );
            logger.log('resourceUrl:', resourceUrl);
            this.context.selectedProfilePicture.set(resourceUrl);
            this.context.openCloseProfileSelectorModal();
        } catch (error) {
            await this.toasts.presentToastAsync(error, 'danger');
            return;
        }

        this.isLoading = false;
    }

    cancel() {
        this.context.profileSelectorModal.set(false);
        this.modal.dismiss(null, 'cancel');
    }

    confirm() {
        this.context.profileSelectorModal.set(false);
        this.modal.dismiss(this.name, 'confirm');
    }

    onWillDismiss(event: Event) {
        const ev = event as CustomEvent<OverlayEventDetail<string>>;
        if (ev.detail.role === 'confirm') {
            this.message = `Hello, ${ev.detail.data}!`;
        }
    }
}
