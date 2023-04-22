import { GLib } from '../gjs/gi.js'

import { Callbacks } from './callbacks.js'
import { Objects } from './objects.js'
import { collected, weak, type WeakCallback } from './weak.js'

/** Functions for dealing with {@link GLib}'s `timeout` functions. */
namespace Timeout {
    /** A {@link WeakCallback} that receives nothing and returns anything. */
    type AnyWeakCallback = WeakCallback<() => unknown>

    /** Used in {@link GLib.timeout_add} to keep the *timeout source* running. */
    const CONTINUE = GLib.SOURCE_CONTINUE
    /** Used in {@link GLib.timeout_add} to stop the *timeout source*. */
    const REMOVE = GLib.SOURCE_REMOVE

    /**
     * Run a {@link WeakCallback} passed via `this` parameter until it is callected, at which point
     * {@link REMOVE} is returned so the timeout source is ended.
     *
     * @returns The {@link CONTINUE} flag while `this` is alive, and {@link REMOVE} after the callback
     *  is garbage-collected.
     */
    function runUntilCollected(this: AnyWeakCallback): typeof CONTINUE | typeof REMOVE {
        const result = this()
        // we can only be sure its collected with `this[collected]`, but using the
        // callback result may unnecessary checks
        if (result === collected && this[collected]) {
            return REMOVE
        } else {
            return CONTINUE
        }
    }

    /**
     * A numerical ID that references a *timeout* {@link GLib.Source}.
     *
     * Source IDs can be reissued after a source has been destroyed.
     */
    type TimeoutTag = ReturnType<GLib['timeout_add']>

    /**
     * A safe wrapper around {@link GLib.Source.remove}, that doesn't call that function when `this` has already been
     * collected. Since a {@link TimeoutTag} can be reused for different sources, calling `remove` with a tag of from
     * an already removed source may cause unexpected errors.
     *
     * @param timeoutTag The ID returned by {@link GLib.timeout_add}.
     * @returns `true` if the source was removed as a result from this call, or `false` if it was already remove
     *  beforehand.
     */
    function safeRemove(this: AnyWeakCallback, timeoutTag: ReturnType<GLib['timeout_add']>): boolean {
        if (this[collected]) {
            return false
        } else {
            const removed = GLib.Source.remove(timeoutTag)
            this.collect()
            return removed
        }
    }

    /** Check if the timeout source was already removed. */
    function isFinished(this: AnyWeakCallback) {
        return this[collected]
    }

    /** Functions for accessing the *timeout source*. */
    export interface TimeoutRef {
        /** Stops the *timeout source*. */
        readonly remove: (this: void) => boolean
        /** Checks if the *timeout source* has been removed. */
        readonly finished: (this: void) => boolean
    }

    /**
     * Start a {@link GLib.timeout_add} that calls {@link callback} every {@link millis} milliseconds.
     *
     * @param callback Function to be called every interval.
     * @param millis Interval time in milliseconds.
     * @returns Functions to remove the source and to check if has been removed already.
     */
    export function start(callback: AnyWeakCallback, millis: number): TimeoutRef {
        const onRepeat = runUntilCollected.bind(callback)
        // we need to collect the callback when the source is removed to prevent GLib.Source.remove from running twice
        const onStop = callback.collect

        const tag = GLib.timeout_add(GLib.PRIORITY_LOW, millis, onRepeat, onStop)

        const remove = safeRemove.bind(callback, tag)
        const finished = isFinished.bind(callback)
        return { remove, finished }
    }
}
Object.freeze(Timeout)

/** Represents a Interval started by {@link Interval.start}. */
export interface Interval {
    /**
     * Stops the interval.
     *
     * @returns `true` if the interval was destroyed as a result of this call, or `false` if it has been removed
     *  before.
     */
    readonly cancel: (this: void) => boolean
    /** `true` if the interval has been stopped, `false` otherwise. */
    readonly finished: boolean
}

export namespace Interval {
    /** Options for {@link Interval.start}. */
    export interface Options {
        /** The interval time in seconds. */
        readonly seconds: number
    }

    /**
     * Repeatedly calls {@link callback} with {@link thisArg} as `this` parameter until {@link thisArg} is
     * garbage collected or the returned {@link Interval.cancel} is called.
     *
     * @param thisArg Internal data passed to `callback` via `this` parameter. The data is stored in a weak reference.
     * @param callback The function to be called every interval.
     * @param opt Interval options.
     * @returns A {@link Interval} object, able to stop the interval later.
     */
    export function start<This extends object>(thisArg: This, callback: (this: This) => void, opt: Options): Interval {
        const millis = opt.seconds * 1_000
        const { remove, finished } = Timeout.start(weak(thisArg, callback), millis)

        return Objects.create({
            cancel: {
                value: Callbacks.freeze(remove, `cancel ${callback.name}`),
                enumerable: true,
                configurable: false,
                writable: false,
            },
            finished: {
                get: Callbacks.freeze(finished, `finished ${callback.name}`),
                enumerable: true,
                configurable: false,
                writable: false,
            }
        })
    }
}
Object.freeze(Interval)
