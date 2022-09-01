import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Platform } from '@ionic/angular';
import { handleAndDecode } from 'src/app/utils/promises';
import { ScannerPermissions } from './scanner-permissions.service';

@Injectable({ providedIn: 'root' })
export class ScannerPermissionsGuard implements CanActivate {
    constructor(
        private debug: Debugger,
        private scannerPermissions: ScannerPermissions
    ) {}
    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        this.debug.info('ScannerPermissionsGuard...');

        if (!this.scannerPermissions.isAvailableForPlatform) {
            this.debug.info('Scanner is not available for this platform :(');
            return false;
        }

        const { result, error } = await handleAndDecode(
            BarcodeScanner.checkPermission({ force: true })
        );

        if (error) {
            this.debug.warn(error.toString());
            return false;
        }

        if (result.granted) {
            this.debug.info('Granted :D');
            return true;
        }

        if (result.denied) {
            this.debug.warn('Denied :(');
            return false;
        }

        this.debug.warn('Unknown status:', result);
        return false;
    }
}
