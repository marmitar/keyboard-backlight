/** Represents any error related to callback wrappers. */
export abstract class CallbackError<Marker extends symbol> extends Error {
    /** The {@link Function.name} of the original callback. */
    readonly callbackName: string
    /** The symbol used to differentiate wrappers. */
    readonly marker: Marker

    /**
     * @param callbackName The {@link Function.name} of the original callback.
     * @param marker The symbol used to differentiate wrappers.
     * @param description Additional description of the error.
     */
    constructor(callbackName: string, marker: Marker, description: string) {
        super(`Callback '${callbackName}' ${description}`)
        this.callbackName = callbackName
        this.marker = marker
    }

    override toString(this: this): string {
        return `${this.constructor.name}(`
            + `callbackName='${this.callbackName}',`
            + ` marker=${this.marker.toString()}`
            + ')'
    }
}

/**
 * Represents a wrapped callback that returned a unique symbol used as marker. These symbol markers should only be used
 * by the wrapper.
 */
export class ReturnValueError<Marker extends symbol> extends CallbackError<Marker> {
    /**
     * @param callbackName The {@link Function.name} of the original callback.
     * @param marker The symbol returned by the callback.
     */
    constructor(callbackName: string, marker: Marker) {
        super(callbackName, marker, `invalid value: ${marker.toString()}`)
    }
}

/**
 * Especial symbol to check if a {@link OnceCallback} callback was already called.
 *
 * Should never be returned by the wrapped callback itself.
 */
export const called: unique symbol = Symbol('called')

/**
 * Represents a {@link OnceCallback} callback that was called more than once.
 */
export class OnceCallbackAlreadyCalled extends CallbackError<typeof called> {
    /**
     * @param callbackName The {@link Function.name} of the original callback.
     */
    constructor(callbackName: string) {
        super(callbackName, called, 'called again through a OnceCallback wrapper')
    }
}

/**
 * Represents a wrapped callback {@link F} that should be called at most a single time throughout the program
 * execution.
 */
export interface OnceCallback<F extends (this: any, ...args: any[]) => any> {
    /**
     * Calls the wrapped callback a single time and release its reference. If called again, throws an error.
     *
     * @param args The arguments to the original callback {@link F}.
     * @returns The value returned by the wrapped callback.
     * @throws {OnceCallbackAlreadyCalled} is being called a second time.
     * @throws {ReturnValueError} if the wrapped callback returns {@link called}.
     */
    (this: ThisParameterType<F>, ...args: Parameters<F>): ReturnType<F>
    /** `true` if the function was already callled before. */
    readonly [called]: boolean
}

/**
 * Creates a {@link OnceCallback} callback wrapping {@link func}.
 *
 * @param func The function to be wrapped. Although the type is `function` or `string`, only `function` should be
 *  passed. The `string` type is used to store the callback name after it has been called.
 * @returns A callback that can only be called once.
 */
function makeOnceCallback<This, A extends any[], R>(
    func: ((this: This, ...args: A) => R) | string,
): OnceCallback<(this: This, ...args: A) => R> {
    /** The wrapper callback. */
    function onceCallback(this: This, ...args: A): R {
        // func is swapped by the function name after the first call, this enables the function to be
        // garbage collected while also holding the name for better error messages
        if (typeof func === 'string') {
            throw new OnceCallbackAlreadyCalled(func)
        }
        const callback = func
        func = callback.name

        const result = callback.call(this, ...args)
        if (result === called) {
            throw new ReturnValueError(func, called)
        }
        return result
    }

    // inserts the check symbol into the callback
    return Object.assign(onceCallback, {
        get [called]() {
            return func === undefined
        }
    })
}

/**
 * Creates a {@link OnceCallback} callback that calls {@link callback} at most once.
 *
 * @param callback The function to be wrapped. The function reference is released after the first call.
 * @returns An equivalent function that cannot be called more than once.
 */
export function once<This, A extends any[], R>(
    callback: (this: This, ...args: A) => R,
): OnceCallback<(this: This, ...args: A) => R> {
    // makeOnceCallback has the right type to release the function reference
    return makeOnceCallback(callback)
}
