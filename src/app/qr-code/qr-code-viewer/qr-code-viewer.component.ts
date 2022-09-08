import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { formatToBlobName } from 'src/app/views/User/User';
import { SafeUrl } from '@angular/platform-browser';
import { Logger, LogLevel } from 'src/app/logger';
import {
    AlertController,
    LoadingController,
    Platform,
    ToastController
} from '@ionic/angular';
import { ApiService } from 'src/app/api';
import { ContextService } from 'src/app/services/context.service';
import { Subscription } from 'rxjs';
import { handleAndDecode } from 'src/app/utils/promises';
import { decodeErrorDetails, ErrorDetails } from 'src/app/utils/errors';
import { AlertUtils, ToastsService } from 'src/app/services';
import { NotImplementedError, RequiredPropError } from 'src/app/errors';

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
export class QrCodeViewerComponent implements OnInit, OnDestroy {
    @ViewChild('qrCodeElement', { static: false })
    qrCodeElement: any;

    @Output() qrCodeSrcEmitter = new EventEmitter<Blob>();

    hasPlatformFinishedLoading: boolean = false;

    private platformName: string = null;
    private qrDownloadDetails: QrCodeDownloadDetails = null;
    private qrImgSrcSubscription: Subscription;
    qrCodeInformation: string = null;

    constructor(
        private loadingController: LoadingController,
        private context: ContextService,
        private debug: Debugger,
        private api: ApiService,
        platform: Platform,
        private alertUtils: AlertUtils,
        private toastUtils: ToastsService
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
        this.qrImgSrcSubscription = this.context.qrImgSrc
            .watch()
            .subscribe((value: string) => {
                logger.log('value:', value);
                this.qrCodeInformation = value;
            });

        logger.log('this.qrCodeInformation:', this.qrCodeInformation);
        this.debug.info('this.qrCodeInformation:', this.qrCodeInformation);

        logger.log('this.platformName:', this.platformName);
        this.debug.info('this.platformName:', this.platformName);
    }

    ngOnDestroy(): void {
        if (this.qrImgSrcSubscription) {
            this.qrImgSrcSubscription.unsubscribe();
            this.qrImgSrcSubscription = null;
        }
    }

    get hasQrInformation(): boolean {
        return this.qrCodeInformation != null;
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

    onChangeURL() {
        if (this.qrCodeElement) {
            const blob = this.getBlob();
            this.qrCodeSrcEmitter.emit(blob);
        }
    }

    async onDownloadClicked() {
        const caller = 'onDownloadClicked';
        this.debug.info('this.platformName:', this.platformName);
        RequiredPropError.throwIfNull(this.platformName, 'platformName', caller);

        const { error } = await handleAndDecode(this.setQrCodeDownloadDetailsAsync());

        if (error) {
            await this.alertUtils.error('No se pudo descargar', error);
            return;
        }

        if (this.platformName.includes('dom') || this.platformName == 'dom') {
            await this.trySaveQrWebAsync();
        } else if (
            this.platformName.includes('cordova') ||
            this.platformName == 'cordova'
        ) {
            await this.trySaveQrAndroidAsync();
        } else {
            throw new NotImplementedError(
                `Unsupported platform "${this.platformName}"`,
                caller
            );
        }
    }

    private async setQrCodeDownloadDetailsAsync(): Promise<void> {
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
    }

    private async trySaveQrWebAsync() {
        this.debug.info('trySaveQrWebAsync...');

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
            await this.toastUtils.success('Código QR guardado');
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            this.debug.error(errorDetails.toString());
            await this.alertUtils.error('No se pudo descargar', errorDetails);
        } finally {
            await loadingDialog.dismiss();
        }
    }

    private async trySaveQrAndroidAsync() {
        this.debug.info('trySaveQrAndroidAsync...');

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
            await this.toastUtils.success('Código QR guardado');
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            this.debug.error(errorDetails.toString());
            await this.alertUtils.error('No se pudo descargar', errorDetails);
        } finally {
            await loadingDialog.dismiss();
        }
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
