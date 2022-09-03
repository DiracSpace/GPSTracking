import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { formatToBlobName } from 'src/app/views/User/User';
import { SafeUrl } from '@angular/platform-browser';
import { Logger, LogLevel } from 'src/app/logger';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/api';

const logger = new Logger({
    source: 'QrCodeViewerComponent',
    level: LogLevel.Off
});

export interface QrCodeDownloadDetails {
    fileName: string;
    blob: Blob;
}

@Component({
    selector: 'app-qr-code-viewer',
    templateUrl: './qr-code-viewer.component.html',
    styleUrls: ['./qr-code-viewer.component.scss']
})
export class QrCodeViewerComponent implements OnInit {
    @ViewChild('qrCodeElement', { static: false })
    qrCodeElement: any;

    @Input() qrCodeInformation: string = '';
    @Output() qrCodeSrcEmitter = new EventEmitter<Blob>();

    hasPlatformFinishedLoading: boolean = false;

    private platformName: string = null;
    private qrDownloadDetails: QrCodeDownloadDetails = null;

    constructor(
        private loadingController: LoadingController,
        private toastController: ToastController,
        private debug: Debugger,
        private api: ApiService,
        platform: Platform
    ) {
        platform.ready().then((result: string) => {
            this.platformName = result;

            debug.info('Platform ready:', result);
            logger.log('result:', result);

            debug.info('Platform name:', this.platformName);
            logger.log('this.platformName:', this.platformName);
            this.hasPlatformFinishedLoading = true;
        });
    }

    ngOnInit() {
        logger.log('this.qrCodeInformation:', this.qrCodeInformation);
        this.debug.info('this.qrCodeInformation:', this.qrCodeInformation);

        logger.log('this.platformName:', this.platformName);
        this.debug.info('this.platformName:', this.platformName);
    }

    get hasFirebase(): boolean {
        if (!this.qrCodeInformation) {
            return false;
        }

        if (this.qrCodeInformation.length < 1) {
            return false;
        }

        return this.qrCodeInformation.includes('firebase');
    }

    get imgSrc(): string | null {
        if (!this.qrCodeElement) {
            logger.log('Could not get qrCodeElement');
            this.debug.error('Could not get qrCodeElement');

            return null;
        }

        const img = this.qrCodeElement.qrcElement.nativeElement.querySelector('img');

        if (!img) {
            logger.log('Could not get qrCodeElement img tag');
            this.debug.error('Could not get qrCodeElement img tag');

            return null;
        }

        return img.src;
    }

    onChangeURL(url: SafeUrl) {
        if (this.qrCodeElement) {
            const blob = this.getBlob();
            this.qrCodeSrcEmitter.emit(blob);
        }
    }

    async onDownloadClicked() {
        logger.log('this.platformName:', this.platformName);
        this.debug.info('this.platformName:', this.platformName);

        if (!this.platformName) {
            throw "Platform name hasn't been obtained!";
        }

        await this.setQrCodeDownloadDetailsAsync();

        if (this.platformName.includes('dom') || this.platformName == 'dom') {
            await this.trySaveQrWebAsync();
        } else if (
            this.platformName.includes('cordova') ||
            this.platformName == 'cordova'
        ) {
            await this.trySaveQrAndroidAsync();
        }
    }

    private async setQrCodeDownloadDetailsAsync(): Promise<void> {
        try {
            const { uid } = await this.api.auth.currentUser;
            const fileName = formatToBlobName(uid);
            let blob: Blob = null;

            if (this.hasFirebase) {
                blob = await this.api.storage.getBlobFromStorage(fileName);
            } else {
                blob = this.getBlob();
            }

            this.qrDownloadDetails = {
                fileName: fileName,
                blob: blob
            };
        } catch (error) {
            logger.log('error:', error);
            this.debug.error('error:', error);
            const toast = await this.toastController.create({
                message: 'No se pudo descargar, por favor intente más tarde.',
                duration: 800
            });
            await toast.present();
        }
    }

    private async trySaveQrWebAsync() {
        logger.log('Downloading on desktop!');
        this.debug.info('Downloading on desktop!');

        const loadingDialog = await this.loadingController.create({
            message: 'Guardando el código QR'
        });
        await loadingDialog.present();

        try {
            this.checkQrDownloadDetails();

            const url = window.URL.createObjectURL(this.qrDownloadDetails.blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.qrDownloadDetails.fileName;
            link.click();
        } catch (error) {
            await loadingDialog.dismiss();

            logger.log('error:', error);
            this.debug.error('error:', error);

            const toast = await this.toastController.create({
                message: 'No se pudo descargar, por favor intente más tarde.',
                duration: 800
            });
            await toast.present();
        }

        await loadingDialog.dismiss();

        const toast = await this.toastController.create({
            message: '¡El código QR se guardó con éxito!',
            duration: 1500
        });
        await toast.present();
    }

    private async trySaveQrAndroidAsync() {
        logger.log('Downloading on android!');
        this.debug.info('Downloading on android!');

        const loadingDialog = await this.loadingController.create({
            message: 'Guardando el código QR'
        });
        await loadingDialog.present();

        try {
            this.checkQrDownloadDetails();

            const base64 = await this.convertBlobToBase64Async(
                this.qrDownloadDetails.blob
            );
            await Filesystem.writeFile({
                path: this.qrDownloadDetails.fileName,
                data: base64,
                directory: Directory.Documents
            });
        } catch (error) {
            await loadingDialog.dismiss();

            logger.log('error:', error);
            this.debug.error('error:', error);

            const toast = await this.toastController.create({
                message: 'No se pudo descargar, por favor intente más tarde.',
                duration: 800
            });
            await toast.present();
        }

        await loadingDialog.dismiss();

        const toast = await this.toastController.create({
            message: '¡El código QR se guardó con éxito!',
            duration: 1500
        });
        await toast.present();
    }

    private checkQrDownloadDetails() {
        if (!this.qrDownloadDetails) {
            throw 'Could not get detail information';
        }

        if (!this.qrDownloadDetails.fileName) {
            throw 'Could not get filename information';
        }

        if (!this.qrDownloadDetails.blob) {
            throw 'Could not get blob information';
        }
    }

    private getBlob(): Blob {
        // converts base 64 encoded image to blobData
        let blobData = this.convertBase64ToBlob(this.imgSrc);
        // saves as image
        return new Blob([blobData], { type: 'image/png' });
    }

    private convertBase64ToBlob(Base64Image: string) {
        if (!Base64Image) {
            throw 'There are no bytes provided.';
        }

        // split into two parts
        const parts = Base64Image.split(';base64,');
        // hold the content type
        const imageType = parts[0].split(':')[1];
        // decode base64 string
        const decodedData = window.atob(parts[1]);
        // create unit8array of size same as row data length
        const uInt8Array = new Uint8Array(decodedData.length);
        // insert all character code into uint8array
        for (let i = 0; i < decodedData.length; ++i) {
            uInt8Array[i] = decodedData.charCodeAt(i);
        }
        // return blob image after conversion
        return new Blob([uInt8Array], { type: imageType });
    }

    private convertBlobToBase64Async(blob: Blob) {
        return new Promise<string>((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    }
}
