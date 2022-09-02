import {
    BackgroundGeolocationPlugin,
    CallbackError,
    Location,
    WatcherOptions
} from '@capacitor-community/background-geolocation';
import { Logger, LogLevel } from 'src/app/logger';
import { registerPlugin } from '@capacitor/core';
import { Injectable } from '@angular/core';
import { Debugger } from 'src/app/core/components/debug/debugger.service';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
    'BackgroundGeolocation'
);

const logger = new Logger({
    source: 'BackgroundLocationService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class BackgroundLocationService {
    watcherOptions: WatcherOptions = {
        backgroundMessage: 'Cancelar para prevenir el drenaje de su batería.',
        backgroundTitle: 'Estamos actualizando tu ubicación en segundo plano.',
        requestPermissions: true,
        distanceFilter: 50,
        stale: false
    };

    constructor(private debug: Debugger) {}

    async attachWatcherListener() {
        return new Promise<Location>((resolve, reject) => {
            BackgroundGeolocation.addWatcher(
                this.watcherOptions,
                (position: Location, error: CallbackError) => {
                    if (error && error != undefined) {
                        this.debug.error(error);
                        logger.log('We have encountered an error!');
                        if (!error.code) {
                            logger.log('No error!');
                            return;
                        }

                        if (error.code == 'NOT_AUTHORIZED') {
                            this.debug.info('Not authorized!');
                            reject(error);
                        }
                    } else {
                        resolve(position);
                    }
                }
            );
        });
    }
}
