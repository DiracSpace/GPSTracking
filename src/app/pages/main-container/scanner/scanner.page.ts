import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { NavController } from '@ionic/angular';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { Navigation } from 'src/app/navigation';

@Component({
    selector: 'app-scanner',
    templateUrl: './scanner.page.html',
    styleUrls: ['./scanner.page.scss']
})
export class ScannerPage implements AfterViewInit, OnDestroy {
    constructor(
        private debug: Debugger,
        private navController: NavController,
        private nav: Navigation
    ) {}

    ngAfterViewInit(): void {
        this.scan();
    }

    ngOnDestroy(): void {
        this.debug.info('Scanner was stopped');
        BarcodeScanner.stopScan();
    }

    async scan() {
        this.debug.info('Hiding brackground...');
        await BarcodeScanner.hideBackground();

        this.debug.info('Scanning...');
        const result = await BarcodeScanner.startScan();
        this.debug.info('result:', result);

        if (!result.hasContent) {
            this.debug.info('No conent!', result.content);
            this.navController.back();
            return;
        }

        this.debug.info('Content:', result.content);
        const parts = result.content.split('/');
        const uid = parts[parts.length - 1];
        this.debug.info('uid:', uid);
        this.nav.user(uid).go();
    }
}
