import { Debugger } from 'src/app/core/components/debug/debugger.service';
import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    getDoc,
    getDocFromCache,
    getDocFromServer,
    getDocsFromCache,
    getDocsFromServer,
    query,
    QueryDocumentSnapshot,
    QuerySnapshot,
    updateDoc,
    where
} from '@angular/fire/firestore';
import { Logger, LogLevel } from 'src/app/logger';
import { FirebaseEntityConverter, UserLocation } from 'src/app/views';
import { Injectable } from '@angular/core';
import { setDoc } from '@firebase/firestore';
import { HandleFirebaseError } from 'src/app/utils/firebase-handling';
import { ArgumentNullError, NotImplementedError } from 'src/app/errors';

const logger = new Logger({
    source: 'UserLocationService',
    level: LogLevel.Debug
});

const COLLECTION_NAME = 'userlocations';
const HOURS_PASSED_THRESHOLD = 0;
const DAYS_PASSED_THRESHOLD = 1;

@Injectable({ providedIn: 'root' })
export class UserLocationService {
    constructor(private afStore: Firestore, private debug: Debugger) {}

    async hasLocationBeenRegisteredRecentlyAsync(
        entity: UserLocation,
        checkHours: boolean = true,
        checkDays: boolean = false
    ): Promise<boolean> {
        if (!entity) {
            return false;
        }

        if (entity.datesRegistered?.length == 0) {
            return false;
        }

        if (checkHours) {
            logger.log('Checking hours!');
            this.debug.info('Checking hours!');

            let latestDate = entity.datesRegistered.sort().slice(-1)[0];
            latestDate = new Date(latestDate);
            logger.log('latestDate:', latestDate);

            // Null sanity check
            if (!latestDate) {
                // TODO: could this possible? If yes, then just create new date
                return false;
            }

            // We get the time passed since last registered
            let timestampDifference = Math.abs(
                new Date().getTime() - latestDate.getTime()
            );

            let hoursPassedSinceLastRegistered = Math.floor(
                timestampDifference / 1000 / 3600
            );

            logger.log('hoursPassedSinceLastRegistered:', hoursPassedSinceLastRegistered);
            this.debug.info(
                'hoursPassedSinceLastRegistered:',
                hoursPassedSinceLastRegistered
            );

            // Checking if N hours have passed before making new request to firebase
            return HOURS_PASSED_THRESHOLD > hoursPassedSinceLastRegistered;
        }

        if (checkDays) {
            throw new NotImplementedError();
        }

        // By default, just create a new date
        return false;
    }

    async getUsersLocationsAsync(
        checkCache: boolean = true,
        queryByGeohash: boolean = false,
        userId?: string,
        geohash?: string
    ): Promise<UserLocation[]> {
        let entityProperty = queryByGeohash ? 'geohash' : 'uid';
        let entityValue = queryByGeohash ? geohash : userId;

        if (!entityProperty) {
            throw 'No entityProperty was provided!';
        }

        if (!entityValue) {
            throw 'No entityValue was provided!';
        }

        const userLocationCollectionRef = collection(this.afStore, COLLECTION_NAME);
        const userLocationWhereQuery = where(entityProperty, '==', entityValue);
        const userLocationQuery = query(
            userLocationCollectionRef,
            userLocationWhereQuery
        );
        let querySnapshot: QuerySnapshot<DocumentData> = null;

        if (checkCache) {
            try {
                logger.log('Trying to get from cache ... ');
                this.debug.info('Trying to get from cache ... ');
                querySnapshot = await getDocsFromCache(userLocationQuery);
            } catch (error) {
                logger.log('error:', error);
                this.debug.error('error:', error);
                let message = HandleFirebaseError(error);
                throw message;
            }
        }

        if (!querySnapshot) {
            try {
                logger.log('Trying to get from server');
                this.debug.info('Trying to get from server');
                querySnapshot = await getDocsFromServer(userLocationQuery);
            } catch (error) {
                logger.log('error:', error);
                this.debug.error('error:', error);
                let message = HandleFirebaseError(error);
                throw message;
            }
        }

        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) =>
            FirebaseEntityConverter<UserLocation>().fromFirestore(doc)
        );
    }

    async createAsync(entity: UserLocation) {
        if (!entity) {
            throw 'No entity provided!';
        }

        if (!entity.geohash || entity.geohash.length == 0) {
            throw 'No unique location identifier provided in entity!';
        }

        const userLocationDocRef = doc(
            this.afStore,
            COLLECTION_NAME,
            entity.geohash
        ).withConverter(FirebaseEntityConverter<UserLocation>());

        await setDoc(userLocationDocRef, entity);
    }

    async getByGeohashOrDefaultAsync(
        geohash: string,
        uid: string,
        checkCache: boolean = true
    ) {
        const caller = 'getByGeohashOrDefaultAsync';
        ArgumentNullError.throwIfNull(geohash, 'geohash', caller);

        const userLocationDocRef = doc(
            this.afStore,
            COLLECTION_NAME,
            geohash
        ).withConverter(FirebaseEntityConverter<UserLocation>());

        let userLocationSnapshot: DocumentSnapshot<UserLocation> = null;

        if (checkCache) {
            userLocationSnapshot = await this.tryToGetFromCacheOrDefaultAsync(
                userLocationDocRef
            );
        }

        if (!userLocationSnapshot) {
            logger.log('Fetching data!');
            try {
                userLocationSnapshot = await getDoc(userLocationDocRef);
            } catch (error) {
                logger.log('error:', error);
                this.debug.error('error:', error);
                return null;
            }
        }

        if (!userLocationSnapshot || !userLocationSnapshot.exists()) {
            return null;
        }

        let userLocation = userLocationSnapshot.data();

        if (userLocation.uid != uid) {
            return null;
        }

        return userLocation;
    }

    private async tryToGetFromCacheOrDefaultAsync(
        userLocationDocRef: DocumentReference<UserLocation>
    ): Promise<QueryDocumentSnapshot<UserLocation> | null> {
        logger.log('Trying to get from cache ... ');
        this.debug.info('Trying to get from cache ... ');
        let cachedDocSnap: DocumentSnapshot<UserLocation> = null;

        try {
            cachedDocSnap = await getDocFromCache(userLocationDocRef);
        } catch (error) {
            logger.log('error:', error);
            this.debug.error('error:', error);

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

    async updateArrayAsync<T>(
        entityKey: string,
        entityId: string,
        entity: T
    ): Promise<void> {
        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<UserLocation>()
        );

        const firebaseEntity = FirebaseEntityConverter<T>().toFirestore(entity);

        let genericObj = {};
        genericObj[entityKey] = arrayUnion(firebaseEntity);

        await updateDoc(userDocRef, genericObj);
    }

    async removeArrayElementAsync<T>(
        entityKey: string,
        entityId: string,
        entity: T
    ): Promise<void> {
        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<UserLocation>()
        );

        const firebaseEntity = FirebaseEntityConverter<T>().toFirestore(entity);

        let genericObj = {};
        genericObj[entityKey] = arrayRemove(firebaseEntity);

        await updateDoc(userDocRef, genericObj);
    }
}
