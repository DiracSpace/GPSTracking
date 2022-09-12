import { geohashForLocation } from 'geofire-common';

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

    _isAccordianHidden?: boolean;
}

export function formatToDocumentName(longitude: number, latitude: number) {
    let message: string;

    if (longitude == 0) {
        message = 'Wrong longitude format.';
        throw message;
    }

    if (latitude == 0) {
        message = 'Wrong latitude format.';
        throw message;
    }

    return geohashForLocation([latitude, longitude]);
}
