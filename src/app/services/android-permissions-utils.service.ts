import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Debugger } from '../core/components/debug/debugger.service';
import { decodeErrorDetails } from '../utils/errors';

@Injectable({ providedIn: 'root' })
export class AndroidPermissionsUtils {
    constructor(
        private debug: Debugger,
        private androidPermissions: AndroidPermissions,
        private locationAccuracy: LocationAccuracy
    ) {}

    async hasAndroidPermissionAsync(permission: any): Promise<boolean> {
        this.debug.info(`Checking permission ${permission}...`);

        const result = await this.androidPermissions.checkPermission(permission);

        if (result.hasPermission) {
            this.debug.info('Permission is already granted :D');
        } else {
            this.debug.info('Permission has not been granted :(');
        }

        return result.hasPermission;
    }

    async requestAndroidPermissionAsync(permission: any): Promise<boolean> {
        this.debug.info(`Requesting permission ${permission}...`);

        const result = await this.androidPermissions.requestPermission(permission);

        if (result.hasPermission) {
            this.debug.info('Permission approved :D');
        } else {
            this.debug.info('Permission denied :(');
        }

        return result.hasPermission;
    }

    /* #region GPS */

    async canRequestLocationAccuracy(): Promise<boolean> {
        this.debug.info('Checking location accuracy permission...');

        const canRequest = await this.locationAccuracy.canRequest();

        if (canRequest) {
            this.debug.info('Permission can be requested :D');
        } else {
            this.debug.info('Permission cannot be requested :(');
        }

        return canRequest;
    }

    async turnOnGpsAsync() {
        this.debug.info('Turning on gps...');
        const accuracy = this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY;
        await this.locationAccuracy.request(accuracy);
        this.debug.info('Turned on gps :D');
    }

    /* #endregion */
}
