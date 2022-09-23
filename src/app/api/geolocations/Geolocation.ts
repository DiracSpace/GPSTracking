import { geohashForLocation } from 'geofire-common';
import { ArgumentNullError } from 'src/app/errors';

export class Geolocation {
    public static readonly CollectionName = 'geolocations';

    id: string;
    userId: string;
    geohash: string;
    longitude: number;
    latitude: number;
    fromBackground: boolean;
    dateRegistered: Date;

    displayName?: string;
    houseNumber?: string;
    postcode?: string;
    country?: string;
    state?: string;
    city?: string;
    road?: string;

    _isAccordianHidden?: boolean;
    _isLoadingLocationData?: boolean;

    static getGeoHashString(longitude: number, latitude: number): string {
        const caller = 'getGeoHashString';
        ArgumentNullError.throwIfNull(longitude, 'longitude', caller);
        ArgumentNullError.throwIfNull(latitude, 'latitude', caller);
        return geohashForLocation([latitude, longitude]);
    }
}
