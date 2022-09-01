import { Injectable } from '@angular/core';
import {
    getBlob,
    getDownloadURL,
    getStorage,
    ref,
    StorageError,
    uploadBytesResumable,
    UploadTask,
    UploadTaskSnapshot
} from '@angular/fire/storage';
import { BehaviorSubject } from 'rxjs';
import { Logger, LogLevel } from 'src/app/logger';
import { HandleFirebaseError } from 'src/app/utils/firebase-handling';

const logger = new Logger({
    source: 'StorageService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class StorageService {
    private readonly afStorage = getStorage();

    private readonly resumableTaskSubject = new BehaviorSubject<number>(0);
    public readonly progress = {
        get: () => this.resumableTaskSubject.value,
        set: (value: number) => this.resumableTaskSubject.next(value),
        watch: () => this.resumableTaskSubject.asObservable()
    };

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

    async getBlobFromStorage(fileName: string): Promise<Blob> {
        logger.log('fileName:', fileName);
        const storageRef = ref(this.afStorage, fileName);

        try {
            return await getBlob(storageRef);
        } catch (error) {
            const message = HandleFirebaseError(error);
            throw message;
        }
    }

    async uploadBlobWithProgressAsync(blob: Blob, fileName: string): Promise<string> {
        const storageRef = ref(this.afStorage, fileName);
        this.resumableTask = uploadBytesResumable(storageRef, blob);

        return new Promise<string>((resolve, reject) => {
            this.resumableTask.on(
                'state_changed',
                (snapshot: UploadTaskSnapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    logger.log(`${progress}% done`);
                    this.progress.set(progress);
                },
                (error: StorageError) => {
                    logger.log('error:', error);
                    const message = HandleFirebaseError(error);
                    throw message;
                },
                async () => {
                    const taskRef = this.resumableTask.snapshot.ref;
                    const resourceUrl = await getDownloadURL(taskRef);
                    return resolve(resourceUrl);
                }
            );
        });
    }
}
