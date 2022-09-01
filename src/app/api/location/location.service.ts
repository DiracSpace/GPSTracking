import { FirebaseEntityConverter, Location } from 'src/app/views';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Logger, LogLevel } from 'src/app/logger';
import { Injectable } from '@angular/core';

const logger = new Logger({
    source: 'LocationService',
    level: LogLevel.Debug
});

const COLLECTION_NAME = 'locations';

@Injectable({ providedIn: 'root' })
export class LocationService {
    constructor(private afStore: Firestore) { }

    async createAsync(entity: Location): Promise<void> {
        if (!entity) {
            throw 'No entity provided!';
        }

        const locationDocRef = doc(
            this.afStore,
            COLLECTION_NAME,
            entity.id
        ).withConverter(FirebaseEntityConverter<Location>());

        await setDoc(locationDocRef, entity);
    }
}
