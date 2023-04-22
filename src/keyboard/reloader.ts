import { Callbacks } from '../utils/callbacks.js'
import { Interval } from '../utils/interval.js'
import { Objects } from '../utils/objects.js'
import { collected, weak, type WeakCallback } from '../utils/weak.js'

import { Status } from './status.js'
import { XSet } from './xset.js'

/**
 * A callback to be invoked when a new key status arrives.
 *
 * @param this An associated data that is weakly referenced.
 * @param keyStatus The new status that the reloader queried.
 */
export type KeyStatusCallback<Data = void> = (this: Data, keyStatus: Status) => void

/**
 * A {@link Set}-like collection of {@link WeakCallback}s, each with its own `this` data.
 */
class WeakCallbackSet extends Set<WeakCallback<KeyStatusCallback>> {
    /** Construct and freezes the {@link Set}. Elements can still be added after that. */
    constructor() {
        super()
        Object.freeze(this)
    }

    /**
     * Creates a delete callback wrapping a weakly bound {@link Set.delete}, while ensuring the
     * {@link WeakCallbackSet} instance isn't captured.
     *
     * @param deleteFromSet A weakly bound {@link WeakCallbackSet.delete} function.
     * @returns A wrapper around `deleteFromSet` that returns `false` when the weak callback is collected.
     */
    private static makeDeleteCallback<T>(deleteFromSet: WeakCallback<(item: T) => boolean>): (this: T) => boolean {
        /**
         * Removes `this` from the {@link Set}.
         *
         * @returns Returns true if an element in the Set existed and has been removed, or false if the element does
         *  not exist or the set has been collected.
         */
        function deleteCallback(this: T): boolean {
            return deleteFromSet(this) === true
        }
        return deleteCallback
    }

    /** Weakly bound version of {@link WeakCallbackSet.delete}. */
    private readonly boundDelete = weak(this, this.delete)
    /** Function to delete a callback from this set, but returning `false` isntead of {@link collected}. */
    private readonly deleteCallback = WeakCallbackSet.makeDeleteCallback(this.boundDelete)

    /**
     * Creates a {@link WeakCallback} from `data` and `cb`, inserts it in the set and returns a function to remove
     * this new calback from the set.
     *
     * @param data Data associated with `cb`.
     * @param cb Callback to be called with a key {@link Status}.
     * @returns A weakly bound function to remove the callback form the set.
     */
    emplace<Data extends object>(this: this, data: Data, cb: KeyStatusCallback<Data>): CallbackRef['delete'] {
        const weakCb = weak(data, cb)
        this.add(weakCb)
        // 'weakCb' can be strongly bound, since it is already holding 'data' and 'cb' weakly
        const remove = this.deleteCallback.bind(weakCb)
        return Callbacks.freeze(remove, `delete ${cb.name}`)
    }

    /**
     * Call each callback with the given `keyStatus`, removing the already collected callbacks.
     *
     * @param keyStatus Status to be reported to the callbacks.
     */
    callEach(this: this, keyStatus: Status): void {
        const collectedCallbacks: WeakCallback<KeyStatusCallback>[] = []

        this.forEach((cb) => {
            const result = cb(keyStatus)
            if (result === collected && cb[collected]) {
                collectedCallbacks.push(cb)
            }
        })

        collectedCallbacks.forEach(this.boundDelete)
    }

    /** Focefully collects a {@link WeakCallback}. */
    private static collect(this: void, cb: WeakCallback<any>): void {
        cb.collect()
    }

    /**
     * Collects and remove all callbacks in this set.
     */
    override clear(this: this): void {
        this.forEach(WeakCallbackSet.collect)
        super.clear()
    }
}

/** Represents an auto reloader {@link Interval} that ended before its {@link KeyStatusReloader}. */
export class AutoReloaderError extends Error {
    constructor() {
        super("Interval for auto reloading keyboard status was finished unexpectedly")
    }
}

/** Represents a reference to {@link KeyStatusCallback} inside a {@link KeyStatusReloader}. */
export interface CallbackRef {
    /** Delete this callback from the {@link KeyStatusReloader}. */
    readonly delete: (this: void) => boolean
    /** Force the {@link KeyStatusReloader} to query the current key status. */
    readonly reload: WeakCallback<() => Promise<Status[] | undefined>>
}

/**
 * A object that queries the keyboard status regularly a send the status to a set of callbacks.
 */
export class KeyStatusReloader {
    /** The callbacks listening to key updates. */
    private readonly callbacks = new Map<string, WeakCallbackSet>()
    /** Call {@link reload} in a regular interval. */
    private readonly autoReloader = Interval.start(this, this.reload, { seconds: 10 })
    /** Callback used for {@link CallbackRef.reload}. */
    private readonly reloadCallback = weak(this, this.reload)

    /** Constructs the reloader and {@link Object.freeze}s it. */
    constructor() {
        Object.freeze(this)
    }

    /**
     * Throws an error if {@link autoReloader} has finished.
     */
    private assertAutoReloading(this: this): void {
        if (this.autoReloader.finished) {
            throw new AutoReloaderError()
        }
    }

    /**
     * Forces a reload of all key status and send the results to the callbacks.
     *
     * @returns The parsed keyboard status
     */
    async reload(this: this): Promise<Status[] | undefined> {
        try {
            this.assertAutoReloading()

            const query = await XSet.query()
            const currentStatus = Status.parse(query)
            currentStatus.forEach((key) => {
                this.callbacks.get(key.name)?.callEach(key)
            })
            return currentStatus
        } catch (error) {
            log(`${this.constructor.name}: ${error}`)
            if (error instanceof Error) {
                logError(error, this.constructor.name)
            }
            return undefined
        }
    }

    /** Get or create a callback set for {@link key}. */
    private get(this: this, key: string): WeakCallbackSet {
        const callbacks = this.callbacks.get(key)
        if (callbacks instanceof Set) {
            return callbacks
        } else {
            const newSet = new WeakCallbackSet()
            this.callbacks.set(key, newSet)
            return newSet
        }
    }

    /**
     * Inserts {@link callback} as a listener for updates on {@link key}.
     *
     * @param key To key being listened to.
     * @param data Internal data for {@link cb} that should be weakly referenced.
     * @param cb Listener to be called of updates of {@link key}.
     * @returns A reference to the newly inserted callback.
     */
    addCallback<Data extends object>(this: this, key: string, data: Data, cb: KeyStatusCallback<Data>): CallbackRef {
        this.assertAutoReloading()

        const remove = this.get(key).emplace(data, cb)
        return Objects.create({
            delete: {
                value: remove,
                enumerable: true,
                configurable: false,
                writable: false,
            },
            reload: {
                value: this.reloadCallback,
                enumerable: true,
                configurable: false,
                writable: false,
            }
        })
    }

    /**
     * Removes all callbacks in this relaoder and disables the automatic interval reloader.
     */
    clear(this: this): void {
        this.callbacks.clear()
    }
}
