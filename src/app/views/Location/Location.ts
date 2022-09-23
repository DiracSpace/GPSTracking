import { geohashForLocation } from 'geofire-common';
import { ArgumentNullError } from 'src/app/errors';

export class Location {
    geohash?: string;
    id: string;

    longitude: number;
    latitude: number;

    displayName?: string;
    houseNumber?: string;
    postcode?: string;
    country?: string;
    state?: string;
    city?: string;
    road?: string;

    fromBackground: boolean;
    dateRegistered: Date; // TODO: remove this
}

export function getGeoHashString(longitude: number, latitude: number): string {
    const caller = 'getGeoHashString';
    ArgumentNullError.throwIfNull(longitude, 'longitude', caller);
    ArgumentNullError.throwIfNull(latitude, 'latitude', caller);
    return geohashForLocation([latitude, longitude]);
}
