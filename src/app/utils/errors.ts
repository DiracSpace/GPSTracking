export const ERROR_CODE_UNKNOWN = 'Unknown';

export class ErrorDetails {
    message: string;
    name?: string;
    data?: any;

    toString(): string {
        const parts: string[] = [];

        if (this.name) {
            parts.push(`[${this.name}]`);
        }

        parts.push(this.message);

        const joined = parts.join(' ');
        return joined;
    }
}

export function decodeErrorDetails(error: any): ErrorDetails {
    // console.log('error', error);

    const details = new ErrorDetails();

    if (error instanceof Error) {
        // console.log('instance of error');
        details.name = error.name;
        details.message = error.message;
    } else if (error instanceof GeolocationPositionError) {
        // console.log('instance of GeolocationPositionError');
        details.name = 'GeolocationPositionError';
        details.message = error.message;
        details.data = {
            code: error.code
        };
    } else {
        // console.log('unknown error');
        details.name = ERROR_CODE_UNKNOWN;
        details.message = error;
    }

    return details;
}
