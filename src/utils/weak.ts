import { Callbacks } from './callbacks.js'
import { Objects } from './objects.js'

/** Especial symbol to check if a {@link WeakCallback} callback was already collected. */
export const collected: unique symbol = Symbol('collected')
/** Especial symbol to check if a {@link WeakCallback} callback was already collected. */
export type collected = typeof collected

/**
 * Controls the weak reference to the `this` data passed to `callback`.
 */
class CallbackData<This extends object, A extends any[], R> {
    /** A weak reference to the function's internal `this` data, if not yet garbage-collected. */
    private weakRef?: WeakRef<This>
    /** The original callback, if the `this` data has not been garbage-collected yet. */
    private callback?: (this: This, ...params: A) => R

    /**
     * @param thisArg The data to be passed to `calbback` via the `this` paramater.
     * @param callback The callback to be called with `thisArg`.
     */
    constructor(thisArg: This, callback: (this: This, ...params: A) => R) {
        this.weakRef = new WeakRef(thisArg)
        this.callback = callback
        // make CallbackData final
        Object.preventExtensions(this)
    }

    /**
     * Drop strong reference to {@link callback} and the weak reference {@link weakRef} to the
     * `callback`'s `this` parameter, deleting them from this `CallbackData` so they can be
     * garbage-collected later on.
     */
    private dropReferences(this: this): void {
        delete this.weakRef
        delete this.callback
    }

    /**
     * Returns a strong reference to `thisArg` and the callback if they are are still recheable, or {@link collected}
     * if `thisArg` has been garbage collected.
     *
     * If {@link collected} is returned, then both {@link weakRef} and {@link callback} are deleted, releasing their
     * strong references and enabling garbage collection on them too.
     */
    private deref(this: this): { thisArg: This, callback: (this: This, ...params: A) => R } | collected {
        if (this.weakRef === undefined && this.callback === undefined) {
            return collected
        }

        const thisArg = this.weakRef?.deref()
        const callback = this.callback
        if (thisArg === undefined || callback === undefined) {
            this.dropReferences()
            return collected
        }
        return { thisArg, callback }
    }

    /**
     * Calls {@link callback} with `this` set to the data in {@link weakRef} if it hasn't been garabage-collected yet.
     * Otherwise, drop all internal references and return {@link collected}.
     */
    call(this: this, ...params: A): R | collected {
        const data = this.deref()
        if (data === collected) {
            return collected
        }

        return data.callback.apply(data.thisArg, params)
    }

    /**
     * Returns `true` if the {@link callback}'s `thisArg` can still be reached, or `false` if it has already been
     * garbage-collected.
     */
    isCollected(this: this): boolean {
        return this.deref() === collected
    }

    /**
     * Release the references to `thisArg` and the {@link callback}, so they can be garbage collected.
     *
     * @returns `true` if the callback was released by this call, or `false` if `this` has already been
     *  released before.
     */
    collect(this: this): boolean {
        const present = (this.deref() !== collected)
        this.dropReferences()
        return present
    }
}
Object.freeze(CallbackData)

/**
 * Holds a bound callback `F` along with a {@link WeakRef} to its internal data, passed via the function `this`
 * argument while the data is still reachable.
 */
export interface WeakCallback<F extends (...args: readonly any[]) => any> {
    /**
     * Calls the wrapped callback if `this` is still referenceable. If `this` has been garbage collected,
     * {@link collected} is returned and the function reference is released.
     *
     * @param args The arguments to the original callback `F`.
     * @returns The value returned by the wrapped callback or {@link collected}.
     */
    (this: void, ...args: Parameters<F>): ReturnType<F> | collected
    /** `true` if the internal data was already garbage collected. */
    readonly [collected]: boolean
    /**
     * Release the references to `this` and the function, so they can be garbage collected.
     *
     * @returns `true` if the callback was released by this call, or `false` if `this` has already been
     *  garbage collected.
     */
    readonly collect: (this: void) => boolean
}

/**
 * Creates a {@link WeakCallback} callback that holds `thisArg` via a weak reference.
 *
 * @param thisArg Data to be passed to the function's `this` argument.
 * @param callback The function to be wrapped.
 * @returns An equivalent function that doesn't hold a strong reference to its internal `this` argument.
 */
export function weak<This extends object, A extends any[], R>(
    thisArg: This,
    callback: (this: This, ...params: A) => R
): WeakCallback<(...args: A) => R>  {

    const data = new CallbackData(thisArg, callback)
    const call = data.call.bind(data)
    const isCollected = data.isCollected.bind(data)
    const collect = data.collect.bind(data)

    // the weak callback is created here, but still needs renaming and freezing
    const weakCallback = Object.assign(call, Objects.create({
        [collected]: {
            get: Callbacks.freeze(isCollected, `collected ${callback.name}`),
            configurable: false,
            enumerable: false,
            writable: false,
        },
        collect: {
            value: Callbacks.freeze(collect, `collect ${callback.name}`),
            configurable: false,
            enumerable: false,
            writable: false,
        }
    }))

    return Callbacks.freeze(weakCallback, `weak ${callback.name}`)
}
