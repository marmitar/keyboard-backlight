import { unwrap } from '../utils/nonnull.js'

import type { Key } from './keys.js'
import { Status } from './status.js'

/** A value that such that `await`ing it results in `T`. */
type Awaitable<T> = T | PromiseLike<T>

/** Special return for {@link CancellablePromise}s that got cancelled. */
const cancelled: unique symbol = Symbol('cancelled')
/** Special return for {@link CancellablePromise}s that got cancelled. */
type cancelled = typeof cancelled

/** A promise that can be cancelled before completion. */
class CancellablePromise<T> implements PromiseLike<T | cancelled> {
    readonly #promise: Promise<T | cancelled>
    #cancelled = false

    /**
     * @param start Function to start the promise.
     */
    constructor(start: (this: CancellablePromise<T>) => Promise<T>) {
        this.#promise = start.call(this).then((value) => {
            if (this.#cancelled) {
                return cancelled
            } else {
                return value
            }
        })
    }

    /** If the promise has been cancelled. */
    get cancelled(): boolean {
        return this.#cancelled
    }

    /** Marks the promise for cancellation. */
    cancel(this: this): void {
        this.#cancelled = true
    }

    then<U, E = never>(
        this: this,
        onfulfilled: (value: T | cancelled) => Awaitable<U>,
        onrejected?: (reason: any) => Awaitable<E>,
    ): Promise<U | E> {
        return this.#promise.then(onfulfilled, onrejected)
    }
}

/**
 * Calls `update` up to `maxRetries` until it returns `true`.
 *
 * @param maxRetries Maximum number of calls to `update`.
 * @param update Function to execute a task and returns if the task was succesfull.
 * @returns A promise that can be cancelled between calls to `update`.
 */
function retry(maxRetries: number, update: (this: void) => Awaitable<boolean>): CancellablePromise<boolean> {
    return new CancellablePromise(async function retry() {
        for (let i = 0; i < maxRetries; i++) {
            if (this.cancelled) {
                return false
            }

            const done = await update()
            if (done) {
                return true
            }
        }
        return false
    })
}

/** Represents a key that could not be changed. */
export class KeyStateCouldNotBeChangedError extends Error {
    /** The key name. */
    readonly key: string
    /** The expected state fot this key. */
    readonly targetState: boolean

    /**
     * @param key The key name.
     * @param targetState The expected state fot this key.
     */
    constructor(key: string, targetState: boolean) {
        super(`${key} could not be turned ${targetState ? 'on' : 'off'}`)
        this.key = key
        this.targetState = targetState
    }

    override toString(this: this): string {
        return `${this.constructor.name}(key="${this.key}", targetState=${this.targetState})`
    }
}

/** High-level controller for a key state. */
export class KeyState<const S extends string> {
    readonly #key: Key<S>

    /**
     * @param key The key controls.
     */
    constructor(key: Key<S>) {
        this.#key = key
        Object.seal(this)
    }

    /**
     * Query the current state for this key.
     *
     * @returns `true` if the key is on, `false` otherwise.
     */
    async get(this: this): Promise<boolean> {
        const status = await Status.query(this.#key.name)
        return unwrap(status?.state) === 'on'
    }

    /** Currently running promise started in {@link set}. */
    #runningPromise: CancellablePromise<boolean> | undefined = undefined

    /**
     * Sets the state for this key.
     *
     * @param state The target key state.
     * @returns The key state after changing it.
     * @throws {KeyStateCouldNotBeChangedError} if the state could not be set.
     */
    async set(this: this, state: boolean): Promise<boolean> {
        this.#runningPromise?.cancel()
        this.#runningPromise = undefined

        const previousState = await this.get()
        if (previousState === state) {
            return previousState
        }

        this.#runningPromise = retry(10, async () => {
            if (state) {
                await this.#key.turnOn()
            } else {
                await this.#key.turnOff()
            }

            const currentState = await this.get()
            return currentState === state
        })

        const result = await this.#runningPromise
        const finalState = await this.get()
        if (result !== cancelled && finalState !== state) {
            throw new KeyStateCouldNotBeChangedError(this.#key.name, state)
        }

        return finalState
    }

    /** Cancel the latest {@link set} operation. */
    remove(this: this): void {
        this.#runningPromise?.cancel()
        this.#runningPromise = undefined
    }
}
