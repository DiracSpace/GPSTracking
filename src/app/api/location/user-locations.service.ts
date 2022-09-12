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

const logger = new Logger({
    source: 'UserLocationService',
    level: LogLevel.Off
});

const COLLECTION_NAME = 'userlocations';

@Injectable({ providedIn: 'root' })
export class UserLocationService {
    constructor(private afStore: Firestore, private debug: Debugger) {}

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

    async bindLocationToUserAsync(
        shortDisplayName: string,
        geohash: string,
        uid: string,
        checkCache: boolean = true
    ) {
        if (!geohash) {
            throw 'No geohash provided!';
        }

        if (!uid) {
            throw 'No UserId provided!';
        }

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
        } else {
            userLocationSnapshot = await getDocFromServer(userLocationDocRef);
        }

        logger.log('userLocationSnapshot:', userLocationSnapshot);
        this.debug.info('userLocationSnapshot:', userLocationSnapshot);

        if (!userLocationSnapshot || !userLocationSnapshot.exists()) {
            logger.log('No relation between user and location found!');
            this.debug.info('No relation between user and location found!');
            const userLocation: UserLocation = {
                shortDisplayName: shortDisplayName,
                geohash: geohash,
                uid: uid
            };

            await this.createAsync(userLocationDocRef, userLocation);
        } else {
            logger.log('Found relation between user and location!');
            this.debug.info('Found relation between user and location!');

            logger.log('geohash:', geohash);
            this.debug.info('geohash:', geohash);
            await this.updateArrayAsync('datesRegistered', geohash, new Date());
        }
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

    async createAsync(
        userLocationDocRef: DocumentReference<UserLocation>,
        entity: UserLocation
    ) {
        try {
            logger.log('Creating entity:', entity);
            this.debug.info('Creating entity:', entity);
            await setDoc(userLocationDocRef, entity);
        } catch (error) {
            let message = HandleFirebaseError(error);
            throw message;
        }
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
