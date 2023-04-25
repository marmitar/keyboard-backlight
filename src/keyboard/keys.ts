import { Objects } from '../utils/objects.js'

import { NumLockX } from './numlockx.js'
import { XModMap } from './xmodmap.js'
import { XSet } from './xset.js'

/** An object that controls a key in keyboard. */
export interface Key<S extends string> {
    /** The key name in {@link XSet}. */
    readonly name: S
    /** Command to turn the key on. */
    readonly turnOn: (this: void) => Promise<void>
    /** Command to turn the key off. */
    readonly turnOff: (this: void) => Promise<void>
}

/** Creates a frozen key object. */
function createKey<const S extends string>({ name, turnOn, turnOff }: Key<S>): Key<S> {
    return Objects.create({
        name: {
            value: name,
            enumerable: true,
            configurable: false,
            writable: false,
        },
        turnOn: {
            value: turnOn,
            enumerable: true,
            configurable: false,
            writable: false,
        },
        turnOff: {
            value: turnOff,
            enumerable: true,
            configurable: false,
            writable: false,
        }
    })
}

/** Controls the `Num Lock` key.  */
export namespace NumLock {
    const name = 'Num Lock'

    /** The key name in {@link XSet}. */
    export type Key = typeof name

    /** Turns on the `Num Lock` key. */
    async function turnOn(): Promise<void> {
        await Promise.all([
            XSet.on(name),
            NumLockX.on(),
        ])
    }

    /** Turns off the `Num Lock` key. */
    async function turnOff(): Promise<void> {
        await Promise.all([
            XSet.off(name),
            NumLockX.off(),
        ])
    }

    /** Represents the `Num Lock` key. */
    export const KEY = createKey({ name, turnOn, turnOff })
}

/** Wraps a function to run a single time. */
class Once {
    #body: (() => Promise<void>) | undefined

    /**
     * @param body The function that must run only once.
     */
    constructor(body: (this: void) => Promise<void>) {
        this.#body = body
    }

    /** Run the wrapped function the first time it is called. */
    run(this: this): void | Promise<void> {
        if (this.#body) {
            const promise = this.#body()
            this.#body = undefined
            return promise
        }
    }
}

/** Controls the `Scroll Lock` key.  */
export namespace ScrollLock {
    const name = 'Scroll Lock'

    /** The key name in {@link XSet}. */
    export type Key = typeof name

    /** Is required only a single run, most of the time. */
    const prepareScrollLock = new Once(XModMap.prepareScrollLock)

    /** Turns on the `Scroll Lock` key. */
    async function turnOn(): Promise<void> {
        await prepareScrollLock.run()
        await XSet.on(name)
    }

    /** Turns off the `Scroll Lock` key. */
    async function turnOff(): Promise<void> {
        await prepareScrollLock.run()
        await XSet.off(name)
    }

    /** Represents the `Scroll Lock` key. */
    export const KEY = createKey({ name, turnOn, turnOff })
}
