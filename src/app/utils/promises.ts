import { decodeErrorDetails, ErrorDetails } from './errors';

interface PromiseResult<T> {
    result: T;
    error: any;
}

export async function handle<T>(promise: Promise<T>): Promise<PromiseResult<T>> {
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

export async function handleAndDecode<T>(
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
