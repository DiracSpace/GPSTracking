import { collection, doc, Firestore, writeBatch } from '@angular/fire/firestore';
import { EntityConverter, User } from 'src/app/views';
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
            return;
        }

        const userDocRef = doc(this.afStore, COLLECTION_NAME, entity.uid).withConverter(
            EntityConverter<User>()
        );
        await setDoc(userDocRef, entity);
    }

    async createAllAsync(entities: User[]): Promise<void> {
        // TODO: handle error in UI
        if (!entities || entities.length == 0) {
            return;
        }

        const batch = writeBatch(this.afStore);

        for (const entity of entities) {
            const userDocRef = doc(
                this.afStore,
                COLLECTION_NAME,
                entity.uid
            ).withConverter(EntityConverter<User>());

            batch.set(userDocRef, entity);
        }

        batch.commit();
    }

    getAsync<T>(entityId: number): Promise<T> {
        throw new Error('Method not implemented.');
    }

    getAllAsync<T>(): Promise<T[]> {
        throw new Error('Method not implemented.');
    }

    deleteAsync<T>(entityId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteAllAsync<T>(entityIds: number[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    updateAsync<T>(entityId: number, entities: T): Promise<T> {
        throw new Error('Method not implemented.');
    }
    
    updateAllAsync<T>(entities: T[]): Promise<T[]> {
        throw new Error('Method not implemented.');
    }
}
