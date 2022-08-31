import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ApiService } from 'src/app/api';
import { Logger, LogLevel } from 'src/app/logger';
import { formatToBlobName } from 'src/app/views/User/User';

const logger = new Logger({
    source: 'QrCodeViewerComponent',
    level: LogLevel.Debug
});

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

    constructor(
        private api: ApiService,
    ) {}

    ngOnInit() {}

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
            return null;
        }

        const img = this.qrCodeElement.qrcElement.nativeElement.querySelector('img');

        if (!img) {
            logger.log('Could not get qrCodeElement img tag');
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
        const { uid } = await this.api.auth.currentUser;
        const fileName = formatToBlobName(uid);
        let blob: Blob = null;
        
        if (this.hasFirebase) {
            blob = await this.api.storage.getBlobFromStorage(fileName);
        } else {
            blob = this.getBlob();
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
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
}
