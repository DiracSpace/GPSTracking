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
import { FirebaseEntityConverter, User } from 'src/app/views';
import { Logger, LogLevel } from 'src/app/logger';
import { setDoc } from '@firebase/firestore';
import { Injectable } from '@angular/core';

const logger = new Logger({
    source: 'UserService',
    level: LogLevel.Debug
});

const COLLECTION_NAME = 'users';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private afStore: Firestore) {}

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
        if (entityId == null || entityId.length == 0) {
            return null;
        }

        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<User>()
        );
        let userSnapshot: DocumentSnapshot<User> = null;

        logger.log('searchCache:', searchCache);
        if (searchCache) {
            userSnapshot = await this.tryToGetFromCacheAsync(userDocRef);
        }

        if (!userSnapshot) {
            logger.log('Fetching data!');
            userSnapshot = await getDoc(userDocRef);
        }

        return userSnapshot.data();
    }

    private async tryToGetFromCacheAsync(userDocRef: DocumentReference<User>) {
        logger.log('Trying to get from cache ... ');
        let cachedDocSnap: DocumentSnapshot<User> = null;

        try {
            cachedDocSnap = await getDocFromCache(userDocRef);
        } catch (error) {
            logger.log('error.code:', error.code);
        }

        if (!cachedDocSnap) return null;
        if (!cachedDocSnap.exists()) return null;

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
        return querySnap.docs.map((document: QueryDocumentSnapshot<DocumentData>) => {
            return document.data() as User;
        });
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

    async updateArrayAsync<T>(
        entityKey: string,
        entityId: string,
        entity: T
    ): Promise<void> {
        const userDocRef = doc(this.afStore, COLLECTION_NAME, entityId).withConverter(
            FirebaseEntityConverter<User>()
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
            FirebaseEntityConverter<User>()
        );

        const firebaseEntity = FirebaseEntityConverter<T>().toFirestore(entity);

        let genericObj = {};
        genericObj[entityKey] = arrayRemove(firebaseEntity);

        await updateDoc(userDocRef, genericObj);
    }
}
