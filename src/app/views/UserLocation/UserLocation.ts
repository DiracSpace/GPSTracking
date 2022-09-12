import { Location } from '../Location/Location';

export class UserLocation {
    datesRegistered?: Date[];
    shortDisplayName: string;
    geohash: string;
    uid: string;

    _isLoadingLocationData?: boolean;
    _isAccordianHidden?: boolean;
    _location?: Location;
}
