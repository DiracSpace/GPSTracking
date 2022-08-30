import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Logger, LogLevel } from 'src/app/logger';

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
    @ViewChild('qrCodeElement', { static: true })
    qrCodeElement: any;

    @Input() qrCodeInformation: string = '';
    @Output() qrCodeSrc = new EventEmitter<string>();

    constructor() {}

    ngOnInit() {}

    get imgSrc() {
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
            this.qrCodeSrc.emit(this.imgSrc);
        }
    }

    onDownloadClicked() {
        if (this.imgSrc) {
            logger.log('this.imgSrc:', this.imgSrc);

            // converts base 64 encoded image to blobData
            let blobData = this.convertBase64ToBlob(this.imgSrc);
            // saves as image
            const blob = new Blob([blobData], { type: 'image/png' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // name of the file
            link.download = 'Qrcode';
            link.click();
        }
    }

    private convertBase64ToBlob(Base64Image: string) {
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
