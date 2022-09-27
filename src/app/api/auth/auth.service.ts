import {
    createUserWithEmailAndPassword,
    getAuth,
    signInAnonymously,
    signInWithEmailAndPassword,
    signOut,
    User
} from '@angular/fire/auth';
import { Logger, LogLevel } from 'src/app/logger';
import { Injectable } from '@angular/core';
import { HandleFirebaseError } from 'src/app/utils/firebase-handling';
import { wait } from 'src/app/utils/time';
import { Router } from '@angular/router';
import { Debugger } from 'src/app/core/components/debug/debugger.service';
import { BehaviorSubject } from 'rxjs';

const logger = new Logger({
    source: 'AuthService',
    level: LogLevel.Debug
});

@Injectable({ providedIn: 'root' })
export class AuthService {
    private afAuth = null;

    private readonly authSubject = new BehaviorSubject<boolean>(false);
    public readonly isAuthenticated = {
        get: () => this.authSubject.value,
        watch: () => this.authSubject.asObservable()
    };

    private authentication = {
        set: (value: boolean) => this.authSubject.next(value)
    };

    constructor(private router: Router, private debug: Debugger) {
        this.afAuth = getAuth();
        this.initAuthDetection();
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
            throw new Error('No se pudo autenticar. Por favor vuelva a iniciar sesión');
        }

        return user;
    }
    /* #endregion */

    async initAuthDetection(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.afAuth.onAuthStateChanged(async (user) => {
                if (user) {
                    // User is signed in
                    logger.log('User is signed in!');
                    this.authentication.set(true);
                    resolve(true);
                } else {
                    logger.log("User isn't signed in!");

                    try {
                        await this.signOut();
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    async signOut(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            signOut(this.afAuth)
                .then(() => {
                    logger.log('Signed Out!');
                    this.authentication.set(false);
                    this.router.navigateByUrl('/login');
                    logger.log('redirecting!');
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
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

    async signInAnonymously() {
        try {
            await signInAnonymously(this.afAuth);
        } catch (error) {
            const message = HandleFirebaseError(error);
            throw message;
        }
    }
}
