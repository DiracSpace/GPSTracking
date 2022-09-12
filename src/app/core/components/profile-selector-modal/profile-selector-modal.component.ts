import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContextService } from 'src/app/services/context.service';
import { Logger, LogLevel } from 'src/app/logger';
import { OverlayEventDetail } from '@ionic/core';
import { IonModal } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

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

    constructor(private context: ContextService) {}

    ngOnInit() {
        this.modalStateSubscription = this.context.profileSelectorModal
            .watch()
            .pipe(skip(1))
            .subscribe((value: boolean) => {
                logger.log('value:', value);
                this.modal.isOpen = value;
            });
    }

    ngOnDestroy(): void {
        this.removeModalStateSubscription();
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
