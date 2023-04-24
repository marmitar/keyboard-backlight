import { Interval, type IntervalOptions } from '../utils/interval.js'

import { Status } from './status.js'

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
    readonly #callbacks = new Array<(data: Map<string, Status>) => void>()
    /** Call {@link reload} in a regular interval. */
    readonly #autoReloader: Interval

    /** Constructs the reloader and {@link Object.freeze}s it. */
    constructor(options: IntervalOptions) {
        this.#autoReloader = Interval.start(options, this, this.reload)
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
     */
    async reload(this: this): Promise<void> {
        try {
            this.#assertAutoReloading()

            const status = await Status.queryAll()
            this.#callbacks.forEach((callback) => callback(status))

        } catch (error) {
            log(`${this.constructor.name}: ${error}`)
            if (error instanceof Error) {
                logError(error, this.constructor.name)
            }
        }
    }

    /**
     * Inserts `callback` as a listener for updates on `key`.
     *
     * @param key To key being listened to.
     * @param callback Listener to be called of updates of `key`.
     * @returns The newly inserted callback.
     */
    addListener(this: this, key: string, callback: (this: void, status: Status) => void): void {
        this.#assertAutoReloading()

        this.#callbacks.push((data) => {
            const status = data.get(key)
            if (status !== undefined) {
                callback(status)
            }
        })
    }

    /**
     * Removes all callbacks in this relaoder and disables the automatic interval reloader.
     */
    destroy(this: this): void {
        this.#callbacks.splice(0)
        this.#autoReloader.cancel()
    }
}
