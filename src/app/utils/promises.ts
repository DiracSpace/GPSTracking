import { decodeErrorDetails, ErrorDetails } from './errors';

interface CallbackResult<T> {
    result: T;
    error: any;
}

interface CallbackResultDecoded<T> {
    result: T;
    error: ErrorDetails;
}

export function handle<T>(callback: () => T): CallbackResult<T> {
    try {
        const result = callback();
        return { result, error: undefined };
    } catch (error) {
        return { result: undefined, error };
    }
}

export function handleAndDecode<T>(callback: () => T): CallbackResultDecoded<T> {
    try {
        const result = callback();
        return { result, error: undefined };
    } catch (error) {
        const errorDetails = decodeErrorDetails(error);
        return { result: undefined, error: errorDetails };
    }
}

interface PromiseResult<T> {
    result: T;
    error: any;
}

export async function handleAsync<T>(promise: Promise<T>): Promise<PromiseResult<T>> {
    try {
        const result = await promise;
        return { result, error: undefined };
    } catch (error) {
        return { result: undefined, error };
    }
}

interface PromiseResultDecoded<T> {
    result: T;
    error: ErrorDetails;
}

export async function handleAndDecodeAsync<T>(
    promise: Promise<T>
): Promise<PromiseResultDecoded<T>> {
    try {
        const result = await promise;
        return { result, error: undefined };
    } catch (error) {
        const errorDetails = decodeErrorDetails(error);
        return { result: undefined, error: errorDetails };
    }
}
