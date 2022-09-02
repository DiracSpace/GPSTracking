import { FirebaseEntityConverter, Location } from 'src/app/views';
import {
    doc,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    setDoc
} from '@angular/fire/firestore';
import { Logger, LogLevel } from 'src/app/logger';
import { Injectable } from '@angular/core';
import { getDocFromCache } from '@firebase/firestore';
import { Debugger } from 'src/app/core/components/debug/debugger.service';

const logger = new Logger({
    source: 'LocationService',
    level: LogLevel.Debug
});

const COLLECTION_NAME = 'locations';

const HOURS_PASSED_THRESHOLD = 2;
const DAYS_PASSED_THRESHOLD = 1;

@Injectable({ providedIn: 'root' })
export class LocationService {
    constructor(private afStore: Firestore, private debug: Debugger) {}

    async createAsync(entity: Location, checkThreshold: boolean = true): Promise<void> {
        if (!entity) {
            throw 'No entity provided!';
        }

        const locationDocName = `${entity.longitude}-${entity.latitude}`;
        const locationDocRef = doc(
            this.afStore,
            COLLECTION_NAME,
            locationDocName
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

                await setDoc(locationDocRef, entity);
            } else {
                logger.log("Interval hasn't passed! Returning ... ");
                this.debug.info("Interval hasn't passed! Returning ... ");
            }
        } else {
            logger.log('Not checking threshold, creating ...');
            this.debug.info('Not checking threshold, creating ...');

            await setDoc(locationDocRef, entity);
        }
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
                ).getDate();
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

            return hoursPassedSinceLastRegistered > HOURS_PASSED_THRESHOLD;
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
}
