import { Component, OnDestroy } from '@angular/core';
import { BarcodeScanner, ScanResult } from '@capacitor-community/barcode-scanner';
import { NavController } from '@ionic/angular';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { ArgumentNullError, RequiredPropError } from 'src/app/errors';
import { Navigation } from 'src/app/navigation';
import { Popups } from 'src/app/services';
import { handleAndDecode, handleAndDecodeAsync } from 'src/app/utils/promises';

@Component({
    selector: 'app-scanner',
    templateUrl: './scanner.page.html',
    styleUrls: ['./scanner.page.scss']
})
export class ScannerPage implements OnDestroy {
    constructor(
        private debug: Debugger,
        private navController: NavController,
        private nav: Navigation,
        private popups: Popups
    ) {}

    ionViewDidEnter(): void {
        this.debug.info('ScannerPage.ionViewDidEnter');
        this.tryStartScanAsync();
    }

    ionViewWillLeave(): void {
        this.debug.info('ScannerPage.ionViewWillLeave');
        this.tryStopScanAsync();
    }

    ngOnDestroy(): void {
        this.debug.info('ScannerPage.ngOnDestroy');
        BarcodeScanner.stopScan();
    }

    private async tryStartScanAsync() {
        this.debug.info('tryStartScanAsync');

        const { error: scanError, result: scanResult } = await handleAndDecodeAsync(
            this.startScanAsync()
        );

        if (scanError) {
            await this.popups.alerts.error(scanError.toString());
            this.navController.pop();
            return;
        }

        this.debug.info('scanResult:', scanResult);

        if (!scanResult.hasContent) {
            await this.popups.alerts.error(
                'La cámara no ha podido detectar un código qr válido. Por favor intenta de nuevo.'
            );
            this.navController.pop();
            return;
        }

        const { error, result: uid } = handleAndDecode(() =>
            this.extractUserUidFromQrCodeScanResult(scanResult)
        );

        if (error) {
            await this.popups.alerts.error(
                'Código qr inválido. Por favor intenta con otro código qr',
                error
            );
            this.navController.pop();
            return;
        }

        await this.tryStopScanAsync();
        await this.nav.user(uid).go({
            extras: {
                replaceUrl: true // Replace URL so user cannot come back to this page. This prevents a qr code scanner bug where the screen goes black
            }
        });
    }

    private async tryStopScanAsync() {
        this.debug.info('tryStopScanAsync');

        const { error } = await handleAndDecodeAsync(this.stopScanAsync());

        if (error) {
            this.debug.error(error.toString());
        }
    }

    async startScanAsync(): Promise<ScanResult> {
        this.debug.info('startScanAsync');
        await BarcodeScanner.hideBackground();
        return await BarcodeScanner.startScan();
    }

    async stopScanAsync() {
        this.debug.info('stopScanAsync');
        await BarcodeScanner.stopScan();
        await BarcodeScanner.showBackground();
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
