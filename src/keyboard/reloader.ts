import { Interval } from '../utils/interval.js'
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
     * Call each callback with the given `keyStatus`, removing the already collected callbacks.
     *
     * @param keyStatus Status to be reported to the callbacks.
     */
    callEach(this: this, keyStatus: Status): void {
        const collectedCallbacks: WeakCallback<KeyStatusCallback>[] = []

        this.forEach((callback) => {
            const result = callback(keyStatus)
            if (result === collected && callback[collected]) {
                collectedCallbacks.push(callback)
            }
        })

        collectedCallbacks.forEach((callback) => this.delete(callback))
    }

    /**
     * Collects and remove all callbacks in this set.
     */
    override clear(this: this): void {
        this.forEach((callback) => callback.collect())
        super.clear()
    }
}

/** Represents an auto reloader {@link Interval} that ended before its {@link KeyStatusReloader}. */
export class AutoReloaderError extends Error {
    constructor() {
        super("Interval for auto reloading keyboard status was finished unexpectedly")
    }
}

/**
 * A object that queries the keyboard status regularly a send the status to a set of callbacks.
 */
export class KeyStatusReloader {
    /** The callbacks listening to key updates. */
    readonly #callbacks = new Map<string, WeakCallbackSet>()
    /** Call {@link reload} in a regular interval. */
    readonly #autoReloader = Interval.start({ seconds: 10 }, this, this.reload)

    /** Constructs the reloader and {@link Object.freeze}s it. */
    constructor() {
        Object.freeze(this)
    }

    /**
     * Throws an error if {@link autoReloader} has finished.
     */
    #assertAutoReloading(this: this): void {
        if (this.#autoReloader.finished) {
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
            this.#assertAutoReloading()

            const query = await XSet.query()
            const currentStatus = Status.parse(query)
            currentStatus.forEach((key) => {
                this.#callbacks.get(key.name)?.callEach(key)
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
    #get(this: this, key: string): WeakCallbackSet {
        const callbacks = this.#callbacks.get(key)
        if (callbacks instanceof WeakCallbackSet) {
            return callbacks
        } else {
            const newSet = new WeakCallbackSet()
            this.#callbacks.set(key, newSet)
            return newSet
        }
    }

    /**
     * Inserts `callback` as a listener for updates on `key`.
     *
     * @param key To key being listened to.
     * @param data Internal data for `cb` that should be weakly referenced.
     * @param cb Listener to be called of updates of `key`.
     * @returns A the newly inserted callback.
     */
    addListener<Data extends object>(
        this: this,
        key: string,
        data: Data,
        cb: KeyStatusCallback<Data>,
    ): WeakCallback<KeyStatusCallback> {
        this.#assertAutoReloading()

        const weakCb = weak(data, cb)
        this.#get(key).add(weakCb)
        return weakCb
    }

    /**
     * Removes all callbacks in this relaoder and disables the automatic interval reloader.
     */
    clear(this: this): void {
        this.#callbacks.clear()
    }
}
