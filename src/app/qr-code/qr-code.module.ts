import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodeViewerComponent } from './qr-code-viewer/qr-code-viewer.component';
import { QRCodeModule } from 'angularx-qrcode';
import { IonicModule } from '@ionic/angular';
import { QrCodeScannerComponent } from './qr-code-scanner/qr-code-scanner.component';

@NgModule({
    declarations: [QrCodeViewerComponent],
    imports: [CommonModule, QRCodeModule, IonicModule],
    exports: [QrCodeViewerComponent]
})
export class QrCodeModule {}
