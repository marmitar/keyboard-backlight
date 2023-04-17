import { once, type OnceCallback } from '../callback/once.js'
import { weak, type WeakCallback } from '../callback/weak.js'
import { WeakCallbackSet } from '../callback/weakSet.js'
import { setInterval } from '../utils/interval.js'

import { Status } from './status.js'
import { XSet } from './xset.js'

/**
 * A callback to be invoked when a new key status arrives.
 *
 * @param this An associated data that is weakly referenced.
 * @param keyStatus The new status that the reloader queried.
 */
export type KeyStatusCallback<Data = void> = (this: Data, keyStatus: Status) => void

/** Represents a reference to {@link KeyStatusCallback} inside a {@link KeyStatusReloader}. */
export interface CallbackRef {
    /** Delete this callback from the {@link KeyStatusReloader}. */
    readonly delete: OnceCallback<(this: void) => void>
    /** Force the {@link KeyStatusReloader} to query the current key status. */
    readonly reload: WeakCallback<() => Promise<void>>
}

/**
 * A object that queries the keyboard status regularly a send the status to a set of callbacks.
 */
export class KeyStatusReloader {
    /** The callbacks listening to key updates. */
    readonly #callbacks = new Map<string, WeakCallbackSet<KeyStatusCallback>>()
    /** Call {@link reload} in a regular interval. */
    readonly #autoReloader = setInterval(this, this.reload, 10_000)
    /** Callback used for {@link CallbackRef.reload}. */
    readonly #reloadCallback = weak(this, this.reload)

    /** Prefix used for logging query errors. */
    get #prefix(): string {
        return this.constructor.name
    }

    /**
     * Force a reload of all key status and send the results to the callbacks.
     */
    async reload(this: this) {
        try {
            const query = await XSet.query()
            const currentStatus = Status.parse(query)
            currentStatus.forEach((key) => {
                this.#callbacks.get(key.name)?.forEach((cb) => cb(key))
            })
        } catch (error) {
            log(`${this.#prefix}: ${error}`)
            if (error instanceof Error) {
                logError(error, this.#prefix)
            }
        }
    }

    /** Get or create a callback set for {@link key}. */
    #get(this: this, key: string): WeakCallbackSet<KeyStatusCallback> {
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
     * Inserts {@link callback} as a listener for updates on {@link key}.
     *
     * @param key To key being listened to.
     * @param data Internal data for {@link cb} that should be weakly referenced.
     * @param cb Listener to be called of updates of {@link key}.
     * @returns A reference to the newly inserted callback.
     */
    addCallback<Data extends object>(this: this, key: string, data: Data, cb: KeyStatusCallback<Data>): CallbackRef {
        const ref = this.#get(key).add(data, cb)
        return { delete: ref.delete, reload: this.#reloadCallback }
    }

    /**
     * Removes all callbacks in this relaoder and disables the automatic interval reloader.
     */
    readonly destroy = once(function destroy(this: KeyStatusReloader) {
        this.#callbacks.clear()
        this.#autoReloader.cancel()
    })
}
