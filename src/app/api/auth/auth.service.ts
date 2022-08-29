import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    User} from '@angular/fire/auth';
import { Logger, LogLevel } from 'src/app/logger';
import { Injectable } from '@angular/core';

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
            throw 'No se pudo autenticar. Por favor vuelva a iniciar sesión'
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
            let message = '';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = `El correo electrónico no está disponible.`;
                    logger.log(message);
                    break;
                case 'auth/invalid-email':
                    message = `El correo electrónico no tiene el formato adecuado.`;
                    logger.log(message);
                    break;
                case 'auth/operation-not-allowed':
                    message = `Error al registrarse.`;
                    logger.log(message);
                    break;
                case 'auth/weak-password':
                    message = 'La contraseña no es lo suficientemente fuerte.';
                    logger.log(message);
                    break;
                case 'auth/quota-exceeded':
                    message = `El proveedor no está disponible de momento.`;
                    logger.log(message);
                    break;
                default:
                    message = error.message;
                    logger.log(message);
                    break;
            }

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
            let message = '';

            switch (error.code) {
                case 'auth/wrong-password':
                    message = `Las credenciales están incorrectas.`;
                    logger.log(message);
                    break;
                case 'auth/invalid-email':
                    message = `Las credenciales están incorrectas.`;
                    logger.log(message);
                    break;
                case 'auth/custom-token-mismatch':
                    message = `Las credenciales están incorrectas.`;
                    logger.log(message);
                    break;
                case 'auth/user-not-found':
                    message = `El correo electrónico no está registrado.`;
                    logger.log(message);
                    break;
                case 'auth/quota-exceeded':
                    message = `El proveedor no está disponible de momento.`;
                    logger.log(message);
                    break;
                default:
                    message = error.message;
                    logger.log(message);
                    break;
            }

            throw message;
        }
    }
}
