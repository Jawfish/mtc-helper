/** Represents a result that can be either successful (with data) or failed (with an error). */
type Result<T> = readonly [T | undefined, Error | undefined];

/**
 * Creates an Error object from an unknown error value.
 * @param error - The error value to convert.
 * @returns An Error object.
 */
const createError = (error: unknown): Error =>
    error instanceof Error ? error : new Error(String(error), { cause: error });

/**
 * Wraps a function in a try/catch block and returns a Result.
 * @param fn - The function to wrap.
 * @returns A Result containing either the function's return value or an error.
 */
export const v = <T>(fn: () => T): Result<T> => {
    try {
        return [fn(), undefined] as const;
    } catch (error) {
        return [undefined, createError(error)] as const;
    }
};

/**
 * Wraps a promise in a try/catch block and returns a Result.
 * @param promise - The promise to wrap.
 * @returns A Promise that resolves to a Result containing either the promise's resolved value or an error.
 */
export const vv = async <T>(promise: Promise<T>): Promise<Result<T>> => {
    try {
        return [await promise, undefined] as const;
    } catch (error) {
        return [undefined, createError(error)] as const;
    }
};

/**
 * Checks if a Result is successful (has data and no error).
 * @param result - The Result to check.
 * @returns True if the Result is successful, false otherwise.
 */
export const good = <T>([_, error]: Result<T>): boolean => error === undefined;

/**
 * Retries an async operation a specified number of times with exponential backoff.
 * @param operation - The async operation to retry.
 * @param maxRetries - The maximum number of retry attempts. Default is 3.
 * @param baseDelay - The initial delay in milliseconds before the first retry. Default is 1000ms.
 * @returns A Promise that resolves to a Result containing either the successful operation result or an error.
 */
export const retry = async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<Result<T>> => {
    for (let attempt = 0; attempt < maxRetries - 1; attempt++) {
        const result = await vv(operation());
        if (good(result)) return result;
        await new Promise(resolve => setTimeout(resolve, baseDelay * 2 ** attempt));
    }

    return vv(operation());
};

/**
 * Creates a timeout wrapper for a promise.
 * @param promise - The Promise to wrap with a timeout.
 * @param timeoutMs - The timeout duration in milliseconds.
 * @returns A Promise that resolves to a Result containing either the value of the original Promise if it completes before the timeout, or a timeout error.
 */
export const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<Result<T>> => {
    const timeoutPromise = new Promise<never>((_resolve, reject) =>
        setTimeout(
            () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
            timeoutMs
        )
    );

    return vv(Promise.race([promise, timeoutPromise]));
};
