import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ToastController } from '@ionic/angular';
import { Logger, LogLevel } from 'src/app/logger';

const logger = new Logger({
    source: 'QrCodeScannerComponent',
    level: LogLevel.Debug
});

@Component({
    selector: 'app-qr-code-scanner',
    templateUrl: './qr-code-scanner.component.html',
    styleUrls: ['./qr-code-scanner.component.scss']
})
export class QrCodeScannerComponent implements OnInit {
    scanActive: boolean = false;
    constructor(private toastController: ToastController) {}

    ngOnInit() {}

    async startScanner() {
        const allowed = await this.checkPermission();
		logger.log("allowed:", allowed);

        if (allowed) {
            await this.scan();
        } else {
            const toast = await this.toastController.create({
                message: '¡No se puede escaner el código QR sin permisos!',
                duration: 2000
            });
            await toast.present();
        }
    }

    async scan() {
        this.scanActive = true;
        BarcodeScanner.hideBackground();
        const result = await BarcodeScanner.startScan();

		logger.log("result:", result);

        if (result.hasContent) {
            this.scanActive = false;
            logger.log('result.content:', result.content);
        } else {
            const toast = await this.toastController.create({
                message: 'No se encontró contenido dentro del código QR.',
                duration: 1500
            });
            await toast.present();
        }
    }

    stopScanner() {
        BarcodeScanner.stopScan();
        this.scanActive = false;
    }

    ionViewWillLeave() {
        this.stopScanner();
    }

    private async checkPermission(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const status = await BarcodeScanner.checkPermission({ force: true });

            if (status.denied) {
                const toast = await this.toastController.create({
                    message: '¡No se puede escaner el código QR sin permisos!',
                    duration: 2000
                });
                await toast.present();
                reject(false);
            }

            if (status.granted) {
                resolve(true);
            }
        });
    }
}
