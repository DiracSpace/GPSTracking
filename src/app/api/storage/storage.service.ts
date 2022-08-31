import { Injectable } from '@angular/core';
import {
    getStorage,
    ref,
    uploadBytes,
    uploadBytesResumable,
    UploadTask
} from '@angular/fire/storage';
import { Logger, LogLevel } from 'src/app/logger';
import { HandleFirebaseError } from 'src/app/utils/firebase-handling';

const logger = new Logger({
    source: 'StorageService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class StorageService {
    private afStorage = getStorage();
    resumableTask: UploadTask = null;
    constructor() {}

    pauseTask(): boolean {
        if (!this.resumableTask) {
            throw 'No hay ninguna tarea de fondo';
        }

        return this.resumableTask.pause();
    }

    resume(): boolean {
        if (!this.resumableTask) {
            throw 'No hay ninguna tarea de fondo';
        }

        return this.resumableTask.resume();
    }

    cancelTask(): boolean {
        if (!this.resumableTask) {
            throw 'No hay ninguna tarea de fondo';
        }

        return this.resumableTask.cancel();
    }

    async uploadBlobAsync(blob: Blob, fileName: string) {
        try {
            const storageRef = ref(this.afStorage, fileName);
            const uploadResult = await uploadBytes(storageRef, blob);
        } catch (error) {
            const message = HandleFirebaseError(error);
            throw message;
        }
    }

    async uploadTaskAsync(blob: Blob, fileName: string) {
        try {
            const storageRef = ref(this.afStorage, fileName);
            this.resumableTask = uploadBytesResumable(storageRef, blob);
        } catch (error) {}
    }
}
