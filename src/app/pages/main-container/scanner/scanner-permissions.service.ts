import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ScannerPermissions {
    constructor(private platform: Platform) {}

    get isAvailableForPlatform(): boolean {
        if (
            this.platform.is('desktop') ||
            this.platform.is('mobileweb') ||
            this.platform.is('pwa')
        ) {
            return false;
        }

        return (
            this.platform.is('android') ||
            this.platform.is('capacitor') ||
            this.platform.is('cordova') ||
            this.platform.is('hybrid') ||
            this.platform.is('ios') ||
            this.platform.is('ipad') ||
            this.platform.is('iphone') ||
            this.platform.is('mobile')
        );
    }
}
