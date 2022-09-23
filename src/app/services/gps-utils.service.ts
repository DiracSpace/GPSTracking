import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation, Geoposition } from '@awesome-cordova-plugins/geolocation/ngx';
import { Platform } from '@ionic/angular';
import { ApiService } from '../api';
import { userLocations } from '../core/components/bottom-navigation/bottom-navigation.component';
import { Debugger } from '../core/components/debug/debugger.service';
import { handleAndDecodeAsync } from '../utils/promises';
import { UserLocation } from '../views';
import { getGeoHashString, Location } from '../views/Location/Location';
import { AndroidPermissionsUtils } from './android-permissions-utils.service';
import { Popups } from './popups';
import { guid } from '../utils';
import { ArgumentNullError } from '../errors';
import { AuthService } from '../api/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class GpsUtils {
    /**
     * Used by several methods in this service.
     * Must be set by the only public method "saveMyLocationAsync".
     * */
    private userId: string;

    constructor(
        private auth: AuthService,
        private platform: Platform,
        private debug: Debugger,
        private geolocation: Geolocation,
        private api: ApiService,
        private androidPermissions: AndroidPermissions,
        private androidPermissionsUtils: AndroidPermissionsUtils,
        private popups: Popups
    ) {}

    async saveMyLocationAsync() {
        const { error: userIdError, result: userId } = await handleAndDecodeAsync(
            this.getUserIdAsync()
        );

        if (userIdError) {
            await this.popups.toasts.error(userIdError.toString());
            return;
        }

        this.userId = userId;

        const permissionVerified = await this.verifyGpsPermissionAsync();

        if (!permissionVerified) {
            await this.popups.alerts.showAsync(
                'No has concedido permiso para acceder al gps :('
            );
            return;
        }

        const getMyLocationLoader = await this.popups.loaders.showAsync(
            'Obteniendo tu ubicacion...'
        );

        const { error: myLocationError, result: myLocation } = await handleAndDecodeAsync(
            this.getMyLocationAsync()
        );

        if (myLocationError) {
            await getMyLocationLoader.dismiss();
            await this.popups.toasts.error(myLocationError.toString());
            return;
        }

        await getMyLocationLoader.dismiss();

        const persistMyLocationLoader = await this.popups.loaders.showAsync(
            'Guardando tu ubicación...'
        );

        const { error: persistMyLocationError } = await handleAndDecodeAsync(
            this.persistMyLocationAsync(
                myLocation.coords.latitude,
                myLocation.coords.longitude
            )
        );

        if (persistMyLocationError) {
            await persistMyLocationLoader.dismiss();
            await this.popups.toasts.error(persistMyLocationError.toString());
            return;
        }

        await persistMyLocationLoader.dismiss();
        await this.popups.toasts.success('Ubicación guardada');
    }

    private async getUserIdAsync(): Promise<string> {
        const user = await this.auth.getCurrentUserAsync();
        return user.uid;
    }

    private async verifyGpsPermissionAsync(): Promise<boolean> {
        this.debug.info('verifyPermissionForGpsAsync');

        if (!this.platform.is('android')) {
            this.debug.info(
                'Platform is not android. Android permission is not necessary'
            );
            return true;
        }

        this.debug.info('Platform is android. Android permission must be requested');

        // prettier-ignore
        const locationPermission = this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION;

        const { result: hasPermission, error: hasPermissionError } =
            await handleAndDecodeAsync(
                this.androidPermissionsUtils.hasAndroidPermissionAsync(locationPermission)
            );

        if (hasPermissionError) {
            this.debug.error(hasPermissionError.toString());
            return false;
        }

        if (!hasPermission) {
            const {
                result: canRequestLocationAccuracy,
                error: canRequestLocationAccuracyError
            } = await handleAndDecodeAsync(
                this.androidPermissionsUtils.canRequestLocationAccuracy()
            );

            if (canRequestLocationAccuracyError) {
                this.debug.error(canRequestLocationAccuracyError.toString());
                return false;
            }

            if (!canRequestLocationAccuracy) {
                const { result: permissionGranted, error: permissionGrantedError } =
                    await handleAndDecodeAsync(
                        this.androidPermissionsUtils.requestAndroidPermissionAsync(
                            locationPermission
                        )
                    );

                if (permissionGrantedError) {
                    this.debug.error(permissionGrantedError.toString());
                    return false;
                }

                if (!permissionGranted) {
                    this.debug.error('Gps permission was not granted :(');
                    return false;
                }
            }
        }

        const { error: turnOnGpsError } = await handleAndDecodeAsync(
            this.androidPermissionsUtils.turnOnGpsAsync()
        );

        if (turnOnGpsError) {
            this.debug.error(turnOnGpsError.toString());
            return false;
        }

        return true;
    }

    private async getMyLocationAsync(): Promise<Geoposition> {
        this.debug.info('getMyLocationAsync...');
        const myLocation = await this.geolocation.getCurrentPosition({
            timeout: 10000, // TODO Make this an env var?
            enableHighAccuracy: true, // TODO Make this an env var?
            maximumAge: 0 // TODO Make this an env var?
        });
        this.debug.info('Got my location!', myLocation);
        return myLocation;
    }

    private async persistMyLocationAsync(
        latitude: number,
        longitude: number,
        fromBackground: boolean = false
    ) {
        const caller = 'persistLocationAsync';
        ArgumentNullError.throwIfNull(latitude, 'latitude', caller);
        ArgumentNullError.throwIfNull(longitude, 'longitude', caller);

        const geohash = getGeoHashString(longitude, latitude);

        await this.api.geolocations.createAsync({
            id: guid(),
            userId: this.userId,
            geohash: getGeoHashString(longitude, latitude),
            longitude: longitude,
            latitude: latitude,
            fromBackground: fromBackground,
            dateRegistered: new Date()
        });

        return;
        // Try to get cached version first
        let userLocation: UserLocation;

        this.debug.info(
            `Trying to get an existing UserLocation with geohash ${geohash}...`
        );

        const existingUserLocation =
            await this.api.userLocation.getByGeohashOrDefaultAsync(
                geohash,
                this.userId,
                true // Try to get from cache
            );

        if (existingUserLocation) {
            userLocation = existingUserLocation;
        } else {
            this.debug.info(
                `Could not find an existing UserLocation with geohash ${geohash} :(`
            );

            this.debug.info('Creating new Location..');
            const createdLocation = await this.createLocationIfNotExistsAsync(
                geohash,
                latitude,
                longitude,
                fromBackground
            );

            this.debug.info('Creating new UserLocation..');
            userLocation = await this.createUserLocationIfNotExistsAsync(createdLocation);
        }

        this.debug.info('userLocation:', userLocation);

        this.debug.info('Updating UserLocation array...');

        await this.api.userLocation.updateArrayAsync(
            'datesRegistered',
            geohash,
            new Date()
        );

        this.debug.info('Updating UserLocations...');
        await this.updateUserLocationsAsync();
    }

    private async createLocationIfNotExistsAsync(
        geohash: string,
        latitude: number,
        longitude: number,
        fromBackground: boolean = false
    ): Promise<Location> {
        const location = {
            id: guid(),
            geohash: geohash,
            latitude: latitude,
            longitude: longitude,
            fromBackground: fromBackground,
            dateRegistered: new Date()
        };

        const createdLocation = await this.api.location.createIfNotExistsAsync(
            location,
            false // Do not check cache
        );

        return createdLocation;
    }

    private async createUserLocationIfNotExistsAsync(
        location: Location
    ): Promise<UserLocation> {
        this.debug.info('Trying to create UserLocation...');

        const existingUserLocation =
            await this.api.userLocation.getByGeohashOrDefaultAsync(
                location.geohash,
                this.userId,
                false
            );

        if (existingUserLocation) {
            this.debug.info('The UserLocation already exists!');
            return existingUserLocation;
        }

        this.debug.info('The UserLocation does not exist! Creating new...');

        const newUserLocation: UserLocation = {
            shortDisplayName: `${location.city}, ${location.state}`,
            geohash: location.geohash,
            uid: this.userId
        };

        await this.api.userLocation.createAsync(newUserLocation);

        this.debug.info('Created new UserLocation!');

        return newUserLocation;
    }

    /**
     * This function requests data from Firebase Cloud, which does the following:
     * * Creates location if not exists in cloud.
     * * Creates relation between user and location if not exists in cloud.
     *
     * This function does *NOT* check local cache version, so any requests count
     * to quota usage for Firebase.
     *
     * @param geohash - unique location identifier
     * @param latitude
     * @param longitude
     * @param fromBackground - state to check if it's from background listener
     */
    private async createLocationIfNotExistsAndRelateToUserAsync(
        geohash: string,
        latitude: number,
        longitude: number,
        fromBackground: boolean = false
    ) {
        const location = {
            id: guid(),
            geohash: geohash,
            latitude: latitude,
            longitude: longitude,
            fromBackground: fromBackground,
            dateRegistered: new Date()
        };

        const createdLocation = await this.api.location.createIfNotExistsAsync(
            location,
            false
        );

        this.debug.info('createdLocation:', createdLocation);

        const userLocationRelation =
            await this.api.userLocation.getByGeohashOrDefaultAsync(
                createdLocation.geohash,
                this.userId,
                false
            );

        this.debug.info('userLocationRelation:', userLocationRelation);

        if (!userLocationRelation) {
            this.debug.info('New location detected! Creating relation with User');
            const userLocation: UserLocation = {
                shortDisplayName: `${createdLocation.city}, ${createdLocation.state}`,
                geohash: createdLocation.geohash,
                uid: this.userId
            };

            await this.api.userLocation.createAsync(userLocation);
        }
    }

    private async updateUserLocationsAsync() {
        const locations = await this.api.userLocation.getUsersLocationsAsync(
            false,
            false,
            this.userId
        );
        this.debug.info('locations:', locations);

        userLocations.set(locations.length);
        this.debug.info('userLocations.set');
    }
}
