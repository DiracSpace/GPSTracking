import { Logger, LogLevel } from '../logger';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Debugger } from '../core/components/debug/debugger.service';

// const logger = new Logger({
//     source: 'ContextService',
//     level: LogLevel.Off
// });

@Injectable({ providedIn: 'root' })
export class ContextService {
    constructor(private debug: Debugger) {}

    private readonly qrImgSrcSubject = new BehaviorSubject<string>(null);
    qrImgSrc = {
        get: () => this.qrImgSrcSubject.value,
        set: (value: string) => this.qrImgSrcSubject.next(value),
        watch: () => this.qrImgSrcSubject.asObservable()
    };

    private readonly ProfileSelectorModalSubject = new BehaviorSubject<boolean>(false);
    profileSelectorModal = {
        get: () => this.ProfileSelectorModalSubject.value,
        set: (value: boolean) => this.ProfileSelectorModalSubject.next(value),
        watch: () => this.ProfileSelectorModalSubject.asObservable()
    };

    private readonly selectedProfilePictureUrlSubject = new BehaviorSubject<string>(null);
    selectedProfilePicture = {
        get: () => this.selectedProfilePictureUrlSubject.value,
        set: (value: string) => this.selectedProfilePictureUrlSubject.next(value),
        watch: () => this.selectedProfilePictureUrlSubject.asObservable()
    };

    openCloseProfileSelectorModal() {
        this.debug.info('openCloseProfileSelectorModal');

        const isModalOpen = this.profileSelectorModal.get();
        this.debug.info('isModalOpen:', isModalOpen);
        if (isModalOpen) {
            this.debug.info('setting false');
            this.profileSelectorModal.set(false);
        } else {
            this.debug.info('setting true');
            this.profileSelectorModal.set(true);
        }
    }

    private readonly PhotoNameSubject = new BehaviorSubject<string>(null);
    photoName = {
        get: () => this.PhotoNameSubject.value,
        set: (value: string) => this.PhotoNameSubject.next(value)
    };
}
