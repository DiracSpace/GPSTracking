import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    getDoc,
    getDocsFromCache,
    getDocsFromServer,
    query,
    QueryDocumentSnapshot,
    QuerySnapshot,
    setDoc,
    where
} from '@angular/fire/firestore';
import { Logger, LogLevel } from 'src/app/logger';
import { FirebaseEntityConverter, Location, ReverseGeocodingResult } from 'src/app/views';
import { Injectable } from '@angular/core';
import { getDocFromCache } from '@firebase/firestore';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HandleFirebaseError } from 'src/app/utils/firebase-handling';

const logger = new Logger({
    source: 'LocationService',
    level: LogLevel.Debug
});

const COLLECTION_NAME = 'locations';

@Injectable({ providedIn: 'root' })
export class LocationService {
    constructor(
        private afStore: Firestore,
        private debug: Debugger,
        private http: HttpClient
    ) {}

    /**
     * Tries to find if a Location has already been registered
     * by querying the following from the database:
     * * Checks if a document exists by using geohash
     * * Checks if a document exists by using displayName property
     *
     * If the before mentioned both fail, then a new
     * document is created. By default, checkCache is true.
     *
     * @param entity
     * @param checkCache
     * @returns
     */
    async createIfNotExistsAsync(
        entity: Location,
        checkCache: boolean = true
    ): Promise<Location> {
        if (!entity) {
            throw 'No entity provided!';
        }

        if (!entity.geohash) {
            throw 'No unique location identifier provided!';
        }

        // We search by geohash first because we don't want to make
        // an external request to OpenStreetMaps.
        let locationByGeohash = await this.getByGeohashOrDefaultAsync(
            entity.geohash,
            checkCache
        );

        // We have a location registered with that geohash
        // But these seem to differ based on longitude and
        // latitude.
        if (locationByGeohash) {
            logger.log('Geohash location found!');
            this.debug.info('Geohash location found!');
            return locationByGeohash;
        }

        // If the entity doesn't have this property, then
        // we make the external request.
        if (!entity.displayName) {
            logger.log('Requesting displayName from OpenStreetMaps!');
            this.debug.info('Requesting displayName from OpenStreetMaps!');
            // We have to request the new displayName from
            // OpenStreetMaps to determine if a document is already created.
            entity = await this.addGeocodingDataToEntityAsync(entity);
        }

        // We query the database for results based on displayName.
        // The best case scenario is that only one document should
        // be returned.
        let locationsByDisplayName = await this.getByDisplayNameOrDefaultAsync(
            entity.longitude,
            entity.latitude,
            entity.displayName,
            checkCache
        );

        // There should only exist one document in list, but
        // murphy law. Either way, we search for an exact match
        // of DisplayName.
        let locationByDisplayName = locationsByDisplayName.find(
            (x) => x.displayName == entity.displayName
        );

        // We found an exact match, so we return this.
        if (locationByDisplayName) {
            logger.log('DisplayName location found!');
            this.debug.info('DisplayName location found!');
            return locationByDisplayName;
        }

        // We don't have the location based on geohash or displayName
        logger.log('New location detected! Creating ... ');
        const locationDocRef = doc(
            this.afStore,
            COLLECTION_NAME,
            entity.geohash
        ).withConverter(FirebaseEntityConverter<Location>());

        await setDoc(locationDocRef, entity);

        return entity;
    }

    async deleteAsync(entityId: string) {
        const locationDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<Location>()
        );

        try {
            await deleteDoc(locationDocRef);
        } catch (error) {
            logger.log('error:', error);
            const message = HandleFirebaseError(error);
            throw message;
        }
    }

    async getByGeohashOrDefaultAsync(
        geohash: string,
        checkCache: boolean = true
    ): Promise<Location | null> {
        if (!geohash || geohash.length == 0) {
            throw 'No geohash provided!';
        }

        const locationDocRef = doc(this.afStore, COLLECTION_NAME, geohash).withConverter(
            FirebaseEntityConverter<Location>()
        );
        let locationSnapshot: DocumentSnapshot<Location> = null;

        logger.log('checkCache:', checkCache);
        if (checkCache) {
            locationSnapshot = await this.tryToGetFromCacheAsync(locationDocRef);
        }

        if (!locationSnapshot) {
            logger.log('Fetching data!');
            try {
                locationSnapshot = await getDoc(locationDocRef);
            } catch (error) {
                // let invoker handle null results
                return null;
            }
        }

        if (!locationSnapshot || !locationSnapshot.exists()) return null;
        return locationSnapshot.data();
    }

    async getByDisplayNameOrDefaultAsync(
        longitude: number,
        latitude: number,
        displayName: string = '',
        checkCache: boolean = true
    ): Promise<Location[] | null> {
        if (!displayName || displayName.trim().length == 0) {
            logger.log(
                'No displayName property provided! Requesting from OpenStreetMap ... '
            );
            let openStreetMapResult = await this.requestGeocodingFromOpenStreetMap(
                longitude,
                latitude
            );

            if (!openStreetMapResult) {
                throw 'Could not get reverse geocode result.';
            }

            displayName = openStreetMapResult.display_name;
        }

        const locationCollectionRef = collection(this.afStore, COLLECTION_NAME);
        const locationWhereQuery = where('displayName', '==', displayName);
        const locationQuery = query(locationCollectionRef, locationWhereQuery);
        let querySnapshot: QuerySnapshot<DocumentData> = null;

        if (checkCache) {
            try {
                logger.log('Trying to get from cache ... ');
                this.debug.info('Trying to get from cache ... ');
                querySnapshot = await getDocsFromCache(locationQuery);
            } catch (error) {
                logger.log('error:', error);
                this.debug.error('error:', error);
                let message = HandleFirebaseError(error);
                throw message;
            }
        }

        if (!querySnapshot) {
            try {
                logger.log('Trying to get from server ... ');
                this.debug.info('Trying to get from server ... ');
                querySnapshot = await getDocsFromServer(locationQuery);
            } catch (error) {
                logger.log('error:', error);
                this.debug.error('error:', error);
                let message = HandleFirebaseError(error);
                throw message;
            }
        }

        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) =>
            FirebaseEntityConverter<Location>().fromFirestore(doc)
        );
    }

    private async tryToGetFromCacheAsync(locationDocRef: DocumentReference<Location>) {
        logger.log('Trying to get from cache ... ');
        this.debug.info('Trying to get from cache ... ');

        let cachedDocSnap: DocumentSnapshot<Location> = null;

        try {
            cachedDocSnap = await getDocFromCache(locationDocRef);
        } catch (error) {
            logger.log('error:', error);
            this.debug.error(error);

            return null;
        }

        logger.log('cachedDocSnap:', cachedDocSnap);
        this.debug.info('cachedDocSnap:', cachedDocSnap);

        if (!cachedDocSnap) return null;
        if (!cachedDocSnap.exists()) return null;

        logger.log('Exists in cache!');
        this.debug.info('Exists in cache!');
        return cachedDocSnap;
    }

    private async addGeocodingDataToEntityAsync(entity: Location): Promise<Location> {
        const geocodingResult = await this.requestGeocodingFromOpenStreetMap(
            entity.longitude,
            entity.latitude
        );
        logger.log('geocodingResult:', geocodingResult);

        entity.displayName = geocodingResult.display_name;
        entity.postcode = geocodingResult.address.postcode;
        entity.country = geocodingResult.address.country;
        entity.state = geocodingResult.address.state;
        entity.city = geocodingResult.address.city;
        entity.road = geocodingResult.address.road;

        return entity;
    }

    private async requestGeocodingFromOpenStreetMap(longitude: number, latitude: number) {
        let httpQueryParams = new HttpParams();
        httpQueryParams = httpQueryParams.append('format', 'json');
        httpQueryParams = httpQueryParams.append('lat', latitude);
        httpQueryParams = httpQueryParams.append('lon', longitude);

        const completeUrl = new HttpRequest(
            'GET',
            environment.openstreetmap.reverseGeocodingDomain,
            {
                params: httpQueryParams
            }
        );

        return await this.http
            .get<ReverseGeocodingResult>(completeUrl.urlWithParams)
            .toPromise();
    }
}
