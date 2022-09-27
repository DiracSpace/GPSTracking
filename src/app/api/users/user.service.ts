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
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    updateDoc,
    where,
    WhereFilterOp,
    writeBatch
} from '@angular/fire/firestore';
import { FirebaseEntityConverter, User, UserAddress } from 'src/app/views';
import { Logger, LogLevel } from 'src/app/logger';
import { setDoc } from '@firebase/firestore';
import { Injectable } from '@angular/core';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { HandleFirebaseError } from 'src/app/utils/firebase-handling';
import { decodeErrorDetails } from 'src/app/utils/errors';
import { handleAndDecodeAsync } from 'src/app/utils/promises';

const logger = new Logger({
    source: 'UserService',
    level: LogLevel.Off
});

const COLLECTION_NAME = 'users';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private afStore: Firestore, private debug: Debugger) {}

    async createAsync(entity: User): Promise<void> {
        // TODO: handle error in UI
        if (!entity) {
            return null;
        }

        const userDocRef = doc(this.afStore, COLLECTION_NAME, entity.uid).withConverter(
            FirebaseEntityConverter<User>()
        );
        await setDoc(userDocRef, entity);
    }

    /**
     * Uses a batch to create multiple
     * entities in the collection.
     *
     * @param entities
     * @returns null if failed
     */
    async createAllAsync(entities: User[]): Promise<void> {
        // TODO: handle error in UI
        if (!entities || entities.length == 0) {
            return null;
        }

        const batch = writeBatch(this.afStore);

        for (const entity of entities) {
            const userDocRef = doc(
                this.afStore,
                COLLECTION_NAME,
                entity.uid
            ).withConverter(FirebaseEntityConverter<User>());

            batch.set(userDocRef, entity);
        }

        batch.commit();
    }

    async userProfileHasMissingValuesAsync(entityId: string): Promise<boolean> {
        let user: User = null;

        try {
            user = await this.getByUidOrDefaultAsync(entityId);
        } catch (error) {
            logger.log('error:', error);
            this.debug.error('error:', error);
        }

        return (
            !user ||
            !user.username ||
            !user.firstName ||
            !user.middleName ||
            !user.lastNameFather ||
            !user.lastNameMother
        );
    }

    /**
     * Queries all documents in collection
     * where entityId equals uid.
     *
     * Uses cache by default! You can override
     * this by providing false.
     *
     * @param entityId
     * @param searchCache
     * @returns
     */
    async getByUidOrDefaultAsync(
        entityId: string,
        searchCache: boolean = true
    ): Promise<User> {
        this.debug.info('getByUidOrDefaultAsync', entityId, searchCache);

        if (entityId == null || entityId.length == 0) {
            this.debug.info('Invalid uid');
            return null;
        }

        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<User>()
        );
        this.debug.info('userDocRef', userDocRef);

        let userSnapshot: DocumentSnapshot<User> = null;

        if (searchCache) {
            this.debug.info('Setting userSnapshot...');

            const { error: cacheError, result: cacheResult } = await handleAndDecodeAsync(
                this.tryToGetFromCacheAsync(userDocRef)
            );

            if (cacheError) {
                this.debug.error(cacheError.toString());
            } else {
                userSnapshot = cacheResult;
                this.debug.info('Found userSnapshot:', userSnapshot);
            }
        }

        if (!userSnapshot) {
            logger.log('Fetching data!');
            try {
                userSnapshot = await getDoc(userDocRef);
            } catch (error) {
                logger.log('error:', error);
                const message = HandleFirebaseError(error);
                throw message;
            }
        }

        return userSnapshot.data();
    }

    private async tryToGetFromCacheAsync(userDocRef: DocumentReference<User>) {
        this.debug.info('tryToGetFromCacheAsync...');
        let cachedDocSnap: DocumentSnapshot<User> = null;

        try {
            cachedDocSnap = await getDocFromCache(userDocRef);
            this.debug.info('cachedDocSnap', cachedDocSnap);
        } catch (error) {
            const errorDetails = decodeErrorDetails(error);
            this.debug.error(errorDetails.toString());
            const message = HandleFirebaseError(error);
            throw message;
        }

        if (!cachedDocSnap) {
            return null;
        }

        if (!cachedDocSnap.exists()) {
            return null;
        }

        logger.log('Exists in cache!');
        return cachedDocSnap;
    }

    /**
     * Queries all documents in collection
     * where  searchProperty fulfills the
     * searchTerm.
     *
     * @param searchOpStr The conditional string to query by (default is ==)
     * @param searchProperty  The property to compare (default is uid)
     * @param searchTerm The property to search
     * @param fieldToOrderBy Order by property (default is uid)
     * @param amount Amount of results (default is 10)
     * @returns
     */
    async getAllBySearchTermOrDefaultAsync(
        searchOpStr: WhereFilterOp = '==',
        searchProperty: string = 'uid',
        searchTerm: string,
        fieldToOrderBy: string = 'uid',
        amount: number = 10
    ): Promise<User[]> {
        const uidSearchQuery = where(searchProperty, searchOpStr, searchTerm);
        const userCollectionRef = collection(this.afStore, COLLECTION_NAME);
        const userCollectionQuery = query(
            userCollectionRef,
            uidSearchQuery,
            orderBy(fieldToOrderBy),
            limit(amount)
        );

        const querySnap = await getDocs(userCollectionQuery);

        if (querySnap.empty) {
            logger.log('No entities found!');
            return [];
        }

        logger.log('Entities found!');
        return querySnap.docs.map(
            (document: QueryDocumentSnapshot<DocumentData>) => document.data() as User
        );
    }

    deleteAsync(entityId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteAllAsync<T>(entityIds: number[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async updateAsync(entityId: string, entity: User): Promise<void> {
        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<User>()
        );

        await updateDoc(userDocRef, entity);
    }

    async updateUserListPropertyAsync<T>(
        property: string,
        entityId: string,
        entities: T[]
    ) {
        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId);
        const firebaseEntities = entities.map((entity) =>
            FirebaseEntityConverter<T>().toFirestore(entity)
        );

        const genericObj = {};
        genericObj[property] = firebaseEntities;

        await updateDoc(userDocRef, genericObj);
    }

    async updateArrayAsync<T>(
        entityKey: string,
        entityId: string,
        entity: T
    ): Promise<void> {
        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<User>()
        );

        const firebaseEntity = FirebaseEntityConverter<T>().toFirestore(entity);

        const genericObj = {};
        genericObj[entityKey] = arrayUnion(firebaseEntity);

        await updateDoc(userDocRef, genericObj);
    }

    async removeArrayElementAsync<T>(
        entityKey: string,
        entityId: string,
        entity: T
    ): Promise<void> {
        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<User>()
        );

        const firebaseEntity = FirebaseEntityConverter<T>().toFirestore(entity);

        const genericObj = {};
        genericObj[entityKey] = arrayRemove(firebaseEntity);

        await updateDoc(userDocRef, genericObj);
    }
}
