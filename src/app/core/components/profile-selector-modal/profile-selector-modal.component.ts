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

    modalStateSubscription: Subscription;
    removeModalStateSubscription() {
        if (this.modalStateSubscription) {
            this.modalStateSubscription.unsubscribe();
            this.modalStateSubscription = null;
        }
    }

    constructor(
        private context: ContextService,
        private photoService: PhotoService,
        private storageService: StorageService
    ) {}

    ngOnInit() {
        this.modalStateSubscription = this.context.profileSelectorModal
            .watch()
            .pipe(skip(1))
            .subscribe(async (value: boolean) => {
                logger.log('value:', value);
                this.modal.isOpen = value;

                if (this.modal.isOpen) {
                    await this.photoService.loadSaved();
                }
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

    onClickSet(photo: UserPhoto) {
        logger.log('photo:', photo);
        this.context.profileSelectorModal.set(false);
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
