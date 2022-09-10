export class Location {
    uid: string;
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
    dateRegistered: Date;

    _isAccordianHidden?: boolean;
}
