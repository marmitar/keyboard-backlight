import { GLib } from '../gjs/gi.js'

import { collected, weak, type WeakCallback } from './weak.js'

/** Options for {@link Interval.start}. */
export interface IntervalOptions {
    /** The interval time in seconds. */
    seconds: number
}

/** Represents a Interval started by {@link Interval.start}. */
export class Interval {
    readonly #callback: WeakCallback<() => unknown>
    readonly #id: ReturnType<GLib['timeout_add']>

    private constructor({ seconds }: IntervalOptions, callback: WeakCallback<() => void>) {
        const millis = seconds * 1000
        this.#callback = callback
        this.#id = GLib.timeout_add(GLib.PRIORITY_LOW, millis, () => this.#runUntilCollected())

        Object.freeze(this)
    }

    /** `true` if the interval has been stopped, `false` otherwise. */
    get finished(): boolean {
        return this.#callback[collected]
    }

    /**
     * Run a `#callback`  until it is callected, at which point {@link GLib.SOURCE_REMOVE} is returned so the timeout
     * source is ended.
     *
     * @returns The {@link GLib.SOURCE_CONTINUE} flag while `this` is alive, and {@link GLib.SOURCE_REMOVE} after the
     *  callback is garbage-collected.
     */
    #runUntilCollected(this: this): boolean {
        const result = this.#callback()
        if (result === collected && this.finished) {
            return GLib.SOURCE_REMOVE
        } else {
            return GLib.SOURCE_REMOVE
        }
    }

    /**
     * Stops the interval.
     *
     * @returns `true` if the interval was destroyed as a result of this call, or `false` if it has been removed
     *  before.
     */
    cancel(this: this): boolean {
        if (this.finished) {
            return false
        }

        log(`${this.constructor.name} ~ ${this.#callback.name}: Removing ID ${this.#id}`)
        this.#callback.collect()
        return GLib.Source.remove(this.#id)
    }

    /**
     * Repeatedly calls {@link callback} with {@link data} as `this` parameter until {@link data} is
     * garbage collected or the returned {@link Interval.cancel} is called.
     *
     * @param opt Interval options.
     * @param thisArg Internal data passed to `callback` via `this` parameter. The data is stored in a weak reference.
     * @param callback The function to be called every interval.
     * @returns A {@link Interval} object, able to stop the interval later.
     */
    static start<Data extends object>(opt: IntervalOptions, data: Data, callback: (this: Data) => void): Interval {
        return new Interval(opt, weak(data, callback))
    }
}
