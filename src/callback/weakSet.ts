import { once, OnceCallback } from './once.js'
import { weak, WeakCallback } from './weak.js'

/**
 * A {@link WeakCallback} that is part of a {@link WeakCallbackSet}.
 */
export interface WeakCallbackRef<F extends (...args: any[]) => any> extends WeakCallback<F> {
    /**
     * Drop the callback reference and removes itself from the callback set.
     *
     * @returns `true` if the callback was successfully deleted.
     */
    readonly delete: OnceCallback<(this: void) => boolean>
}

/**
 * Creates suitable {@link WeakCallbackRef} such that the {@link WeakCallbackSet} is accessed only via a
 * weak reference in {@link remove}.
 *
 * @param callback The callback to be transformed.
 * @param remove A weak version of {@link Set.delete}.
 * @returns The transformed weak callback with {@link WeakCallbackRef.delete}.
 */
function makeWeakCallbackRef<F extends (...args: any[]) => any>(
    callback: WeakCallback<F>,
    remove: WeakCallback<(item: WeakCallback<F>) => boolean>,
): WeakCallbackRef<F> {
    /** Removes {@link callback} from the set with {@link remove}. */
    function deleteCallback() {
        return remove(callback) === true
    }

    // a WeakCallbackRef is made by assigning a 'delete' method that holds
    // both the callback and the set weakly
    return Object.assign(callback, { delete: once(deleteCallback) })
}

/**
 * A {@link Set}-like collection of {@link WeakCallback}s, each with its own `this` data.
 */
export class WeakCallbackSet<F extends (...args: any[]) => any> {
    /** The backing set where the callbacks are stored. */
    readonly #items = new Set<WeakCallback<F>>()
    /** Weakly bound version of {@link #items.delete}. */
    readonly #deleteItem =  weak(this.#items, this.#items.delete)

    /**
     * Creates a {@link WeakCallbackRef} over {@link callback} and inserts it in this set.
     *
     * @param thisArg Data stored via a {@link WeakRef} for the {@link callback}.
     * @param callback The callback to be wrapped and stored.
     * @returns The newly created {@link WeakCallbackRef}.
     */
    add<This extends object>(
        this: this,
        thisArg: This,
        callback: (this: This, ...args: Parameters<F>) => ReturnType<F>,
    ): WeakCallbackRef<F> {
        // makeWeakCallbackRef ensures callback is not referenced strongly
        const callbackRef = makeWeakCallbackRef(weak(thisArg, callback), this.#deleteItem)
        this.#items.add(callbackRef)
        return callbackRef
    }

    /**
     * Executes a function once for each callback in this set.
     *
     * @param run The function to be applied.
     */
    forEach(this: this, run: (this: void, cb: WeakCallback<F>) => void) {
        this.#items.forEach(run)
    }

    /**
     * Removes a callback from this set.
     *
     * @param callback The function to be removed.
     * @returns `true` the callback was in the set and has been removed, or `false` if the element does not exist.
     */
    delete(this: this, callback: WeakCallbackRef<F>): boolean {
        return this.#items.delete(callback)
    }

    /**
     * Removes all callbacks from this set.
     */
    clear(this: this) {
        this.#items.clear()
    }
}
