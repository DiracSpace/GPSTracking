import { BackgroundGeolocationPlugin, CallbackError, Location, WatcherOptions } from "@capacitor-community/background-geolocation";
import { Logger, LogLevel } from "src/app/logger";
import { registerPlugin } from "@capacitor/core";
import { Injectable } from "@angular/core";

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

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
        stale: false,
    };

    constructor() { }

    async attachWatcherListener() {
        return new Promise<Location>((resolve, reject) => {
            BackgroundGeolocation.addWatcher(this.watcherOptions, (position: Location, error: CallbackError) => {
                if (!error) {
                    logger.log("position:", position);
                    resolve(position);
                }

                logger.log("error:", error);
                if (error.code == "NOT_AUTHORIZED") {
                    logger.log("No permissions");
                    reject(error);
                }
            });
        });
    }
}