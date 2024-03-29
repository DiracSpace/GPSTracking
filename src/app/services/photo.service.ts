import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { ContextService } from './context.service';
import { Logger, LogLevel } from '../logger';
import { Capacitor } from '@capacitor/core';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { UserPhoto } from '../views';

const logger = new Logger({
    source: 'PhotoService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class PhotoService {
    private readonly PHOTO_STORAGE: string = 'photos';
    private areCachedPhotosLoaded = false;
    private photos: UserPhoto[] = [];

    constructor(private platform: Platform, private contextService: ContextService) {}

    get savedPhotos() {
        return this.photos;
    }

    get photoStorage() {
        return this.PHOTO_STORAGE;
    }

    get savedPhotosLoaded() {
        return this.areCachedPhotosLoaded;
    }

    public async loadSaved(uid: string = null): Promise<void> {
        if (!uid) {
            throw 'No se pasó el UserId';
        }

        logger.log('Loading Pictures!');
        // Retrieve cached photo array data
        const photoList = await Preferences.get({ key: this.photoStorage });
        this.photos = JSON.parse(photoList.value) || [];

        if (this.photos.length == 0) {
            logger.log('loaded!');
            return;
        }

        const photoMissingFilepath = this.photos.some((photo) => !photo.filepath);
        logger.log('photoMissingFilepath:', photoMissingFilepath);

        if (photoMissingFilepath) {
            logger.log('Missing filepath!');
            this.photos = [];
            return;
        }

        this.photos = this.photos.filter((photo) => {
            const photoNameParts = photo.filepath.split('_');
            const middleMostPart = photoNameParts[Math.floor(photoNameParts.length / 2)];
            return middleMostPart === uid;
        });
        logger.log('this.photos:', this.photos);

        try {
            // If running on the web...
            if (!this.platform.is('hybrid')) {
                // Display the photo by reading into base64 format
                for (const photo of this.photos) {
                    // Read each saved photo's data from the Filesystem
                    const readFile = await Filesystem.readFile({
                        path: photo.filepath,
                        directory: Directory.Data
                    });

                    // Web platform only: Load the photo as base64 data
                    photo.webViewPath = `data:image/jpeg;base64,${readFile.data}`;
                }
            }
        } catch (error) {
            logger.log('error:', error);
            this.areCachedPhotosLoaded = false;
        }

        logger.log('loaded!');
        this.areCachedPhotosLoaded = this.savedPhotos.length > 0;
    }

    async takePictureAsync() {
        let capturedPhoto: Photo = null;

        try {
            capturedPhoto = await Camera.getPhoto({
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
                correctOrientation: true,
                allowEditing: false,
                quality: 100
            });
        } catch (error) {
            logger.log('error:', error);
        } finally {
            logger.log('capturedPhoto:', capturedPhoto);
            logger.log('this.photos:', this.photos);
            const savedImgFile = await this.savePictureAsync(capturedPhoto);
            this.photos.push(savedImgFile);
            Preferences.set({
                key: this.photoStorage,
                value: JSON.stringify(this.photos)
            });
        }
    }

    // Save picture to file on device
    private async savePictureAsync(cameraPhoto: Photo): Promise<UserPhoto> {
        const formattedDate = new Date().toISOString();
        const fileName = `${this.contextService.photoName.get()}${formattedDate}.jpeg`;

        const userPhoto: UserPhoto = new UserPhoto();

        if (!cameraPhoto) {
            throw 'No cameraPhoto provided!';
        }

        if (!cameraPhoto.webPath) {
            throw 'No webPath provided!';
        }

        if (!fileName) {
            throw 'No fileName provided!';
        }

        userPhoto.blob = await this.getBlob(cameraPhoto.webPath);
        const base64 = await this.convertBlobToBase64Async(userPhoto.blob);
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Data
        });

        if (this.platform.is('hybrid')) {
            userPhoto.webViewPath = Capacitor.convertFileSrc(savedFile.uri);
            userPhoto.filepath = savedFile.uri;
        } else {
            userPhoto.webViewPath = cameraPhoto.webPath;
            userPhoto.filepath = fileName;
        }

        logger.log('userPhoto:', userPhoto);
        return userPhoto;
    }

    async getBlob(webPath: string) {
        if (!webPath) {
            throw 'No webPath provided!';
        }

        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(webPath);
        const blob = await response.blob();

        if (!response || !blob) {
            throw 'No response data!';
        }

        logger.log('blob:', blob);
        return blob;
    }

    private convertBlobToBase64Async(blob: Blob): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    }
}
