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
    level: LogLevel.Off
});

const COLLECTION_NAME = 'locations';

const HOURS_PASSED_THRESHOLD = 2;
const DAYS_PASSED_THRESHOLD = 1;

@Injectable({ providedIn: 'root' })
export class LocationService {
    constructor(
        private afStore: Firestore,
        private debug: Debugger,
        private http: HttpClient
    ) {}

    async createAsync(
        entity: Location,
        checkThreshold: boolean = true
    ): Promise<boolean> {
        if (!entity) {
            throw 'No entity provided!';
        }

        if (!entity.geohash) {
            throw 'No unique location identifier provided!';
        }

        logger.log('entity:', entity);
        const locationDocRef = doc(
            this.afStore,
            COLLECTION_NAME,
            entity.geohash
        ).withConverter(FirebaseEntityConverter<Location>());

        if (checkThreshold) {
            const hasIntervalPassedBeforeCreation =
                await this.checkIfLocationRegisteredTimeHasPassedThreshold(
                    locationDocRef,
                    true,
                    false
                );
            logger.log(
                'hasIntervalPassedBeforeCreation:',
                hasIntervalPassedBeforeCreation
            );
            this.debug.info(
                'hasIntervalPassedBeforeCreation:',
                hasIntervalPassedBeforeCreation
            );

            if (hasIntervalPassedBeforeCreation) {
                logger.log('Interval passed! Creating ... ');
                this.debug.info('Interval passed! Creating ... ');

                return await this.createIfNotExistsAsync(entity, locationDocRef);
            } else {
                logger.log("Interval hasn't passed! Returning ... ");
                this.debug.info("Interval hasn't passed! Returning ... ");
                return false;
            }
        } else {
            logger.log('Not checking threshold, creating ...');
            this.debug.info('Not checking threshold, creating ...');

            return await this.createIfNotExistsAsync(entity, locationDocRef);
        }
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

    async createIfNotExistsAsync(
        entity: Location,
        locationDocRef: DocumentReference<Location>
    ): Promise<boolean> {
        entity = await this.addGeocodingDataToEntityAsync(entity);

        const canCreateLocation = await this.getByDisplayNameAsync(entity.displayName);
        logger.log("canCreateLocation:", canCreateLocation);

        if (canCreateLocation) {
            logger.log("Creating location!");
            await setDoc(locationDocRef, entity);
        }

        return canCreateLocation;
    }

    async getByGeohashAsync(
        geohash: string,
        checkCache: boolean = true
    ): Promise<Location> {
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
                let message = HandleFirebaseError(error);
                throw message;
            }
        }

        return locationSnapshot.data();
    }

    private async getByDisplayNameAsync(
        displayName: string,
        checkCache: boolean = true
    ): Promise<boolean> {
        if (!displayName || displayName.length == 0) {
            throw 'No displayName provided!';
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

        return querySnapshot.size == 0;
    }

    /**
     * It's not very efficient for Firebase quota to
     * register the same location every hour, so we
     * have to add a threshold of DAYS_PASSED_THRESHOLD
     * in order to not register the same location every hour.
     *
     * This is takes into account the following:
     *
     * * The app is running in background in User's house.
     * * We don't need a bunch of Location documents if the User is in one area the next N time.
     * @param locationDocRef
     * @param checkCache
     * @returns
     */
    private async checkIfLocationRegisteredTimeHasPassedThreshold(
        locationDocRef: DocumentReference<Location>,
        checkHours: boolean = false,
        checkDays: boolean = true,
        checkCache: boolean = true
    ): Promise<boolean> {
        let locationSnapshot: DocumentSnapshot<Location> = null;

        logger.log('checkCache:', checkCache);
        this.debug.info('checkCache:', checkCache);

        if (checkCache) {
            locationSnapshot = await this.tryToGetFromCacheAsync(locationDocRef);
        }

        logger.log('locationSnapshot:', locationSnapshot);
        this.debug.info('locationSnapshot:', locationSnapshot);

        if (!locationSnapshot) {
            logger.log('No location found!');
            this.debug.info('No location found!');

            // There was an error, so
            // we return true to create the entity
            return true;
        }

        let snapshotData = locationSnapshot.data();
        logger.log('snapshotData:', snapshotData);
        this.debug.info('snapshotData:', snapshotData);

        if (checkDays) {
            logger.log('checking days!');
            this.debug.info('checking days!');

            let daysPassedSinceLastRegistered: number = 0;

            try {
                let locationRegisteredDate = new Date(
                    snapshotData.dateRegistered
                ).getDate();
                daysPassedSinceLastRegistered = Math.round(
                    (new Date().getDate() - locationRegisteredDate) /
                        (1000 * 60 * 60 * 24)
                );
            } catch (error) {
                logger.log('error:', error);
                this.debug.error(error);

                // There was an error, so
                // we return true to create the entity
                return true;
            }

            logger.log('daysPassedSinceLastRegistered:', daysPassedSinceLastRegistered);
            this.debug.info(
                `daysPassedSinceLastRegistered: ${daysPassedSinceLastRegistered}`
            );

            return daysPassedSinceLastRegistered > DAYS_PASSED_THRESHOLD;
        }

        if (checkHours) {
            logger.log('checking hours!');
            this.debug.info('checking hours!');

            let hoursPassedSinceLastRegistered: number = 0;

            try {
                let locationRegisteredDate = new Date(
                    snapshotData.dateRegistered
                ).getTime();
                var timestampDifference = Math.abs(
                    new Date().getTime() - locationRegisteredDate
                );
                hoursPassedSinceLastRegistered = timestampDifference / 1000 / 3600;
            } catch (error) {
                logger.log('error:', error);
                this.debug.error(error);

                // There was an error, so
                // we return true to create the entity
                return true;
            }

            logger.log('hoursPassedSinceLastRegistered:', hoursPassedSinceLastRegistered);
            this.debug.info(hoursPassedSinceLastRegistered);

            return Math.floor(hoursPassedSinceLastRegistered) > HOURS_PASSED_THRESHOLD;
        }

        return true;
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
