import { Debugger } from 'src/app/core/components/debug/debugger.service';
import {
    arrayRemove,
    arrayUnion,
    doc,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    getDocFromCache,
    getDocFromServer,
    QueryDocumentSnapshot,
    updateDoc
} from '@angular/fire/firestore';
import { Logger, LogLevel } from 'src/app/logger';
import { FirebaseEntityConverter, UserLocation } from 'src/app/views';
import { Injectable } from '@angular/core';
import { setDoc } from '@firebase/firestore';
import { HandleFirebaseError } from 'src/app/utils/firebase-handling';

const logger = new Logger({
    source: 'UserLocationService',
    level: LogLevel.Debug
});

const COLLECTION_NAME = 'userlocations';

@Injectable({ providedIn: 'root' })
export class UserLocationService {
    constructor(private afStore: Firestore, private debug: Debugger) {}

    async bindLocationToUserAsync(
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

        if (!userLocationSnapshot.exists()) {
            logger.log('No relation between user and location found!');
            this.debug.info('No relation between user and location found!');
            const userLocation: UserLocation = {
                geohash: geohash,
                uid: uid
            };

            await this.createAsync(userLocationDocRef, userLocation);
        } else {
            logger.log('Found relation between user and location!');
            this.debug.info('Found relation between user and location!');

            logger.log("geohash:", geohash);
            this.debug.info("geohash:", geohash);
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
