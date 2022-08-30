export class ArgumentNullError extends Error {
    constructor(argumentName: string, caller?: string) {
        if (caller) {
            super(`Argument "${argumentName}" cannot be null. Thrown at "${caller}"`);
        } else {
            super(`Argument "${argumentName}" cannot be null`);
        }

        this.name = 'ArgumentNullError';
    }

    static throwIfNull(argument: any, argumentName: string, caller?: string) {
        if (argument == undefined || argument == null) {
            throw new ArgumentNullError(argumentName, caller);
        }
    }
}

export class RequiredPropError extends Error {
    constructor(propertyName: string, caller?: string) {
        if (caller) {
            super(`Property "${propertyName}" is required. Thrown at "${caller}"`);
        } else {
            super(`Property "${propertyName}" is required`);
        }

        this.name = 'RequiredPropError';
    }

    static throwIfNull(property: any, propertyName: string, caller?: string) {
        if (property == undefined || property == null) {
            throw new RequiredPropError(propertyName, caller);
        }
    }
}

export class NotImplementedError extends Error {
    constructor(message?: string, caller?: string) {
        if (message) {
            if (caller) {
                super(`${message}. Thrown at ${caller}`);
            } else {
                super(message);
            }
        } else {
            super();
        }

        this.name = 'NotImplementedError';
    }
}
