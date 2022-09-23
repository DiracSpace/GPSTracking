import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    collection,
    doc,
    FieldPath,
    Firestore,
    getDocsFromServer,
    query,
    QueryConstraint,
    setDoc,
    where,
    WhereFilterOp
} from '@angular/fire/firestore';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { ArgumentNullError, RequiredPropError } from 'src/app/errors';
import { ReverseGeocodingResult } from 'src/app/views';
import { FirebaseEntityConverter } from 'src/app/views/FirestoreConverter/EntityConverter';
import { environment } from 'src/environments/environment';
import { GetRequest } from '../GetRequest';
import { Geolocation } from './Geolocation';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
    constructor(
        private afStore: Firestore,
        private debug: Debugger,
        private http: HttpClient
    ) {}

    async createAsync(geolocation: Geolocation) {
        const caller = 'createIfNotExistsAsync';
        ArgumentNullError.throwIfNull(geolocation, 'geolocation', caller);
        RequiredPropError.throwIfNull(geolocation.id, 'geolocation.id', caller);
        RequiredPropError.throwIfNull(geolocation.userId, 'geolocation.userId', caller);
        RequiredPropError.throwIfNull(geolocation.geohash, 'geolocation.geohash', caller);
        RequiredPropError.throwIfNull(
            geolocation.longitude,
            'geolocation.longitude',
            caller
        );
        RequiredPropError.throwIfNull(
            geolocation.latitude,
            'geolocation.latitude',
            caller
        );
        RequiredPropError.throwIfNull(
            geolocation.fromBackground,
            'geolocation.fromBackground',
            caller
        );
        RequiredPropError.throwIfNull(
            geolocation.dateRegistered,
            'geolocation.dateRegistered',
            caller
        );

        await this.mapGeocodePropertiesAsync(geolocation);

        const docRef = doc(
            this.afStore,
            Geolocation.CollectionName,
            geolocation.id
        ).withConverter(FirebaseEntityConverter<Geolocation>());

        await setDoc(docRef, geolocation);

        return geolocation;
    }

    async getAsync(request?: GetRequest): Promise<Geolocation[]> {
        const collectionRef = collection(this.afStore, Geolocation.CollectionName);
        const documentQuery = query(collectionRef, ...request?.query);
        const querySnapshot = await getDocsFromServer(documentQuery);
        const results = querySnapshot.docs.map((snapshot) =>
            FirebaseEntityConverter<Geolocation>().fromFirestore(snapshot)
        );
        return results;
    }

    private async mapGeocodePropertiesAsync(location: Geolocation): Promise<void> {
        const reverseGeocodingResult = await this.reverseGeocodeAsync(
            location.longitude,
            location.latitude
        );
        location.displayName = reverseGeocodingResult.display_name;
        location.postcode = reverseGeocodingResult.address.postcode;
        location.country = reverseGeocodingResult.address.country;
        location.state = reverseGeocodingResult.address.state;
        location.city = reverseGeocodingResult.address.city;
        location.road = reverseGeocodingResult.address.road;
    }

    private async reverseGeocodeAsync(
        longitude: number,
        latitude: number
    ): Promise<ReverseGeocodingResult> {
        const url = new HttpRequest(
            'GET',
            environment.openstreetmap.reverseGeocodingDomain,
            {
                params: new HttpParams()
                    .append('format', 'json')
                    .append('lat', latitude)
                    .append('lon', longitude)
            }
        );
        return await this.http.get<ReverseGeocodingResult>(url.urlWithParams).toPromise();
    }
}
