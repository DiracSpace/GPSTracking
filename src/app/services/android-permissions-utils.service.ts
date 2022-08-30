import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Debugger } from '../core/components/debug/debugger.service';
import { decodeErrorDetails } from '../utils/errors';

@Injectable({ providedIn: 'root' })
export class AndroidPermissionUtils {
    constructor(
        private debug: Debugger,
        private androidPermissions: AndroidPermissions,
        private locationAccuracy: LocationAccuracy
    ) {}

    async hasPermissionAsync(permission: any): Promise<boolean> {
        this.debug.info(`Checking permission ${permission}...`);

        try {
            const result = await this.androidPermissions.checkPermission(permission);

            if (result.hasPermission) {
                this.debug.info('Permission is granted :D');
                return true;
            } else {
                this.debug.info('Permission has not been granted :(');
                return false;
            }
        } catch (error) {
            const details = decodeErrorDetails(error);
            this.debug.error('Permission could not be checked');
            this.debug.error(details.toString());
            throw error;
        }
    }

    async requestPermissionAsync(permission: any): Promise<boolean> {
        this.debug.info(`Requesting permission ${permission}...`);

        try {
            const canRequest = await this.locationAccuracy.canRequest();

            if (canRequest) {
                this.debug.info('Permission is already granted');
                return true;
            }

            this.debug.info('Permission has not been granted yet');

            const result = await this.androidPermissions.requestPermission(permission);

            if (result.hasPermission) {
                this.debug.info('Permission approved :D');
                return true;
            } else {
                this.debug.info('Permission denied :(');
                return false;
            }
        } catch (error) {
            const details = decodeErrorDetails(error);
            this.debug.error('Permission could not be requested');
            this.debug.error(details.toString());
            throw error;
        }
    }

    async turnOnGpsAsync() {
        this.debug.info('Turning on gps...');

        try {
            const accuracy = this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY;
            await this.locationAccuracy.request(accuracy);
            this.debug.info('Turned on gps :D');
        } catch (error) {
            const details = decodeErrorDetails(error);
            this.debug.error('Could not turn on gps :(');
            this.debug.error(details.toString());
            throw error;
        }
    }
}
