import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    User
} from '@angular/fire/auth';
import { Logger, LogLevel } from 'src/app/logger';
import { Injectable } from '@angular/core';
import { HandleFirebaseError } from 'src/app/utils/firebase-handling';

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
    get currentUser(): Promise<User> {
        return new Promise((resolve, reject) => {
            const unsubscribe = this.afAuth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            }, reject);
        });
    }

    async getCurrentUserAsync(): Promise<User> {
        const user = await this.currentUser;

        if (!user) {
            throw 'No se pudo autenticar. Por favor vuelva a iniciar sesión';
        }

        return user;
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
        } catch (error) {
            const message = HandleFirebaseError(error);
            throw message;
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
        } catch (error) {
            const message = HandleFirebaseError(error);
            throw message;
        }
    }
}
