import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    User,
    UserCredential
} from '@angular/fire/auth';
import { Logger, LogLevel } from 'src/app/logger';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

const logger = new Logger({
    source: 'AuthService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class AuthService {
    private afAuth = getAuth();

    constructor() {
        this.afAuth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                logger.log('User is signed in!');
            } else {
                logger.log("User isn't signed in!");
            }
        });
    }

    /* #region userInformation */
    get currentUser() {
        return this.afAuth.currentUser;
    }

    userProfile() {
        if (!this.currentUser) {
            logger.log('No currently signed in user!');
            return null;
        }

        return this.currentUser;
    }

    get displayName(): string | undefined {
        return this.currentUser?.displayName;
    }

    get email(): string | undefined {
        return this.currentUser?.email;
    }

    get photoUrl(): string | undefined {
        return this.currentUser?.photoURL;
    }
    /* #endregion */

    signOut() {
        return this.afAuth.signOut();
    }

    async createUserWithEmailAndPasswordAsync(email: string, password: string) {
        try {
            const credentials = await createUserWithEmailAndPassword(
                this.afAuth,
                email,
                password
            );
            logger.log('Signed up!');
            return credentials.user;
        } catch (err) {
            logger.log('Not signed up!');
            logger.log('err:', err);
        }
    }

    async signInWithEmailAndPassword(email: string, password: string) {
        try {
            const credentials = await signInWithEmailAndPassword(
                this.afAuth,
                email,
                password
            );
            logger.log('Signed in!');
            return credentials.user;
        } catch (err) {
            logger.log('Not signed in');
            logger.log('err:', err);
        }
    }
}
