import { ReverseGeocodingAddress } from './ReverseGeocodingAddress.interface';

export interface ReverseGeocodingResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address: ReverseGeocodingAddress;
    boundingbox: string[];
}
