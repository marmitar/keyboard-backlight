import { once, type OnceCallback, ReturnValueError } from './once.js'

/**
 * Especial symbol to check if a {@link Once} callback was already called.
 *
 * Should never be returned by the wrapped callback itself.
 */
export const collected: unique symbol = Symbol('collected')
/** Especial symbol to check if a {@link Once} callback was already called. */
export type Collected = typeof collected

/**
 * Holds a wrapped callback {@link F} along with a {@link WeakRef} to its internal data, passed through the
 * function `this` argument.
 */
export interface WeakCallback<F extends (...args: any[]) => any> {
    /**
     * Calls the wrapped callback if `this` is still referenceable. If `this` has been garbage collected,
     * {@link collected} is returned the function reference is released.
     *
     * @param args The arguments to the original callback {@link F}.
     * @returns The value returned by the wrapped callback or {@link collected}.
     * @throws {ReturnValueError} If the wrapped callback returns {@link collected}.
     */
    (this: void, ...args: Parameters<F>): ReturnType<F> | Collected
    /** `true` if the internal data was already garbage collected. */
    readonly [collected]: boolean
    /**
     * Release the references to `this` and the function, so they can be garbage collected.
     *
     * @returns `true` if the callback was released by this call, or `false` if `this` has already been
     *  garbage collected.
     */
    readonly collect: OnceCallback<() => boolean>
}

/** Strong references to the callback data, if it hasn't been garbage collected yet. */
interface CallbackData<This extends object, A extends any[], R> {
    thisArg: This
    callback: (this: This, ...args: A) => R
}

/**
 * Creates a {@link WeakCallback} callback wrapping {@link callback}. Although the parameters are optional, both
 * values should be passed. The `undefined` is used to release the references once `this` is garbage collected.
 *
 * @param ref A weak reference to the internal data passed via `this`.
 * @param callback The function to be wrapped.
 * @returns A callback that holds a weak reference to its internal `this`.
 */
function makeWeakCallback<This extends object, A extends any[], R>(
    ref?: WeakRef<This>,
    callback?: (this: This, ...args: A) => R,
): WeakCallback<(...args: A) => R> {
    /**
     * Returns a strong reference to `this` and the callback if they are are still recheable, or {@link collected}
     * if `this` has been garbage collected.
     *
     * If {@link collected} is returned or {@link forceRemove} is passed, then both {@link ref} and {@link callback}
     * are set to {@link undefined}, releasing their strong references and enabling garbage collection on them too.
     */
    function deref(forceRemove?: 'remove'): CallbackData<This, A, R> | Collected {
        let data: CallbackData<This, A, R> | Collected = collected

        const thisArg = ref?.deref()
        if (thisArg !== undefined && callback != undefined) {
            data = { thisArg, callback }
        }

        if (data === collected || forceRemove === 'remove') {
            ref = undefined
            callback = undefined
        }
        return data
    }

    /** The wrapper callback. */
    function weakCallback(this: void, ...params: A): R | Collected {
        const data = deref()
        if (data === collected) {
            return collected
        }

        const result = data.callback.call(data.thisArg, ...params)
        if (result === collected) {
            throw new ReturnValueError(data.callback.name, collected)
        }
        return result
    }

    // inserts the check symbol into the callback
    return Object.assign(weakCallback, {
        get [collected]() {
            return deref() === collected
        },
        collect: once(() => deref('remove') !== collected)
    })
}

/**
 * Creates a {@link WeakCallback} callback that holds {@link thisArg} via a weak reference.
 *
 * @param thisArg Data to be passed to the function's `this` argument.
 * @param callback The function to be wrapped.
 * @returns An equivalent function that doesn't hold a strong reference to its internal `this` argument.
 */
export function weak<This extends object, A extends any[], R>(
    thisArg: This,
    callback: (this: This, ...params: A) => R
): WeakCallback<(...args: A) => R>  {
    // makeWeakCallback ensures 'thisArg' isn't captured strongly
    return makeWeakCallback(new WeakRef(thisArg), callback)
}
