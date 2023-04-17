import { GLib } from '../gjs/gi.js'

import { once, type OnceCallback } from '../callback/once.js'
import { collected, type Collected, weak } from '../callback/weak.js'

/** A tag used by {@link GLib} to stop the interval afterwards. */
type TimeoutTag = ReturnType<GLib['timeout_add']>

/**
 * Start a {@link GLib.timeout_add} that calls {@link callback} every {@link millis} milliseconds. If {@link callback}
 * returns {@link collected}, then the timeout is removed.
 *
 * @param callback Function to be called every interval.
 * @param millis Interval time in milliseconds.
 * @returns A tag that can be used in {@link GLib.Source.remove} to stop the interval.
 */
function startTimeout(callback: () => void | Collected, millis: number): TimeoutTag {
    return  GLib.timeout_add(GLib.PRIORITY_LOW, millis, () => {
        const result = callback()

        if (result === collected) {
            return GLib.SOURCE_REMOVE
        } else {
            return GLib.SOURCE_CONTINUE
        }
    })
}

/** Represents a Interval started by {@link setInterval}. */
export interface Interval {
    /**
     * Stops the interval.
     *
     * @returns `true` if the interval stopped as a result of this call, or `false` if it has been removed before.
     */
    readonly cancel: OnceCallback<(this: void) => boolean>
}

/**
 * Creates a {@link Interval} object with it {@link Interval.cancel} function.
 *
 * @param tag The tag returned by {@link GLib.timeout_add}.
 * @returns The interval object.
 */
function makeIntervalCancel(tag: TimeoutTag): Interval {
    return { cancel: once(() => GLib.Source.remove(tag)) }
}

/**
 * Repeatedly calls {@link callback} with {@link thisArg} as `this` parameter until {@link thisArg} is
 * garbage collected or the returned {@link Interval.cancel} is called.
 *
 * @param thisArg Internal data passed to {@link callback} via `this` parameter. The data is stored in
 *  a weak reference.
 * @param callback The function to be called every interval.
 * @param millis The interval repeat time in milliseconds.
 * @returns A {@link Interval} object, able to stop the interval later.
 */
export function setInterval<This extends object>(
    thisArg: This,
    callback: (this: This) => void,
    millis: number,
): Interval {
    // startTimeout and makeIntervalCancel ensure 'thisArg' isn't captured by closure
    const timeoutTag = startTimeout(weak(thisArg, callback), millis)
    return makeIntervalCancel(timeoutTag)
}
