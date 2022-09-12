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
    private photos: UserPhoto[] = [];

    constructor(private platform: Platform, private contextService: ContextService) {}

    get savedPhotos() {
        return this.photos;
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
            const savedImgFile = await this.savePictureAsync(capturedPhoto);
            this.photos.unshift(savedImgFile);
            Preferences.set({
                key: this.PHOTO_STORAGE,
                value: JSON.stringify(this.photos)
            });
        }
    }

    // Save picture to file on device
    private async savePictureAsync(cameraPhoto: Photo): Promise<UserPhoto> {
        if (!cameraPhoto) {
            throw 'No cameraPhoto provided!';
        }

        // Convert photo to base64 format, required by Filesystem API to save
        const base64Data = await this.readAsBase64Async(cameraPhoto);

        // Write the file to the data directory
        const fileName = this.contextService.photoName.get();
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data
        });

        if (!savedFile) {
            throw 'FileSystem did not provide file!';
        }

        let userPhoto: UserPhoto = null;
        if (this.platform.is('hybrid')) {
            // Display the new image by rewriting the 'file://' path to HTTP
            // Details: https://ionicframework.com/docs/building/webview#file-protocol
            userPhoto = {
                filepath: savedFile.uri,
                webViewPath: Capacitor.convertFileSrc(savedFile.uri)
            };
        } else {
            // Use webPath to display the new image instead of base64 since it's
            // already loaded into memory
            userPhoto = {
                filepath: fileName,
                webViewPath: cameraPhoto.webPath
            };
        }

        return userPhoto;
    }

    // Read camera photo into base64 format based on the platform the app is running on
    private async readAsBase64Async(cameraPhoto: Photo): Promise<string> {
        if (!cameraPhoto) {
            throw 'No cameraPhoto provided!';
        }

        // "hybrid" will detect Cordova or Capacitor
        if (this.platform.is('hybrid')) {
            // Read the file into base64 format
            const file = await Filesystem.readFile({
                path: cameraPhoto.path
            });

            return file.data;
        } else {
            // Fetch the photo, read as a blob, then convert to base64 format
            const response = await fetch(cameraPhoto.webPath!);
            const blob = await response.blob();

            return await this.convertBlobToBase64Async(blob);
        }
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
