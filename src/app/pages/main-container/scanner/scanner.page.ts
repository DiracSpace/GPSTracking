import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { BarcodeScanner, ScanResult } from '@capacitor-community/barcode-scanner';
import { NavController } from '@ionic/angular';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { ArgumentNullError, RequiredPropError } from 'src/app/errors';
import { Navigation } from 'src/app/navigation';
import { AlertUtils, ToastsService } from 'src/app/services';
import { handleAndDecode, handleAndDecodeAsync } from 'src/app/utils/promises';

@Component({
    selector: 'app-scanner',
    templateUrl: './scanner.page.html',
    styleUrls: ['./scanner.page.scss']
})
export class ScannerPage implements AfterViewInit, OnDestroy {
    constructor(
        private debug: Debugger,
        private navController: NavController,
        private nav: Navigation,
        private toasts: ToastsService,
        private alerts: AlertUtils
    ) {}

    ngAfterViewInit(): void {
        this.tryScanAsync();
    }

    ngOnDestroy(): void {
        this.debug.info('Scanner was stopped');
        BarcodeScanner.stopScan();
    }

    async tryScanAsync() {
        this.debug.info('Hiding brackground...');
        await BarcodeScanner.hideBackground();

        this.debug.info('Scanning...');
        const scanResult = await BarcodeScanner.startScan();
        this.debug.info('result:', scanResult);

        if (!scanResult.hasContent) {
            this.debug.info('No conent!', scanResult.content);
            await this.alerts.error(
                'La cámara no ha podido detectar un código qr válido. Por favor intenta de nuevo.'
            );
            this.navController.pop();
            return;
        }

        const { error, result: uid } = handleAndDecode(() =>
            this.extractUserUidFromQrCodeScanResult(scanResult)
        );

        if (error) {
            await this.alerts.error(
                'Código qr inválido. Por favor intenta con otro código qr',
                error
            );
            this.navController.pop();
            return;
        }

        this.nav.user(uid).go();
    }

    private extractUserUidFromQrCodeScanResult(scanResult: ScanResult): string {
        this.debug.info('extractUserUidFromQrCodeScan', scanResult);
        const caller = 'extractUserUidFromQrCodeScan';
        ArgumentNullError.throwIfNull(scanResult, 'scanResult', caller);
        RequiredPropError.throwIfNull(scanResult.content, 'scanResult.content', caller);
        this.debug.info('scanResult.content:', scanResult.content);
        const urlParts = scanResult.content.split('/');
        const uid = urlParts[urlParts.length - 1];
        if (uid == undefined || uid == null || uid.trim().length == 0) {
            throw new Error('ERR_CODE: uid_not_extracted');
        }
        this.debug.info('uid:', uid);
        return uid;
    }
}
