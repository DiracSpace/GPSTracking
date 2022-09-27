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
import { Debugger } from '../debug/debugger.service';
import { decodeErrorDetails } from 'src/app/utils/errors';

// const logger = new Logger({
//     source: 'ProfileSelectorModalComponent',
//     level: LogLevel.Debug
// });

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

    isLoading = false;

    constructor(
        private storageService: StorageService,
        private photoService: PhotoService,
        private authService: AuthService,
        private context: ContextService,
        private toasts: ToastsService,
        private debug: Debugger
    ) {}

    ngOnInit() {
        this.modalStateSubscription = this.context.profileSelectorModal
            .watch()
            .pipe(skip(1))
            .subscribe(async (value: boolean) => {
                this.debug.info('value:', value);
                this.debug.info('this.modal.isOpen:', this.modal.isOpen);
                if (value) {
                    const { uid } = await this.authService.currentUser;
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
        this.debug.info('photo:', photo);

        if (!photo) {
            return;
        }

        this.isLoading = true;

        try {
            this.debug.info('photo:', photo);
            const blob = await this.photoService.getBlob(photo.webViewPath);
            this.debug.info('blob:', blob);

            this.debug.info('uploading to firebase!');
            const resourceUrl = await this.storageService.uploadBlobWithProgressAsync(
                blob,
                `profiles/${photo.filepath}`
            );
            this.debug.info('resourceUrl:', resourceUrl);
            this.context.selectedProfilePicture.set(resourceUrl);
            this.context.openCloseProfileSelectorModal();
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            await this.toasts.error(errorDetails.toString());
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
