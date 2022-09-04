import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodeViewerComponent } from './qr-code-viewer/qr-code-viewer.component';
import { QRCodeModule } from 'angularx-qrcode';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from '../core/core.module';

@NgModule({
    declarations: [QrCodeViewerComponent],
    imports: [CommonModule, CoreModule, QRCodeModule, IonicModule],
    exports: [QrCodeViewerComponent]
})
export class QrCodeModule {}
