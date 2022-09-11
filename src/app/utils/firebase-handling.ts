import { Logger, LogLevel } from '../logger';

const logger = new Logger({
    source: 'HandleFirebaseError',
    level: LogLevel.Debug
});

/**
 * Used for reading error and returning custom user friendly
 * message based on error code from Firebase.
 *
 * @param error
 * @returns
 */
export function HandleFirebaseError(error: any): string {
    if (!error) {
        throw 'No error provided!';
    }

    let message = '';

    switch (error.code) {
        case 'storage/unknown':
            message = `El servicio de almacenamiento no está en funcionamiento.`;
            logger.log(message);
            break;
        case 'storage/object-not-found':
            message = `No se encontró su código QR.`;
            logger.log(message);
            break;
        case 'storage/quota-exceeded':
            message = `El proveedor no está disponible de momento.`;
            logger.log(message);
            break;
        case 'storage/cannot-slice-blob':
            message = `El código QR está corrupto o dañado, por favor vuelva a generarlo.`;
            logger.log('message:', message);
            break;
        case 'storage/server-file-wrong-size':
            message = `El código QR está corrupto o dañado, por favor vuelva a generarlo.`;
            logger.log('message:', message);
            break;
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

    return message;
}
