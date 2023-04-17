/** Represents a `null` or `undefined` where a value was expected. */
export class UnwrapError extends Error {
    /** The nullish value encountered. */
    readonly value: null | undefined

    /**
     * @param value The nullish value encountered.
     */
    constructor(value: null | undefined) {
        super(`expected value here, but got ${value}`)
        this.value = value
    }

    override toString(this: this): string {
        return `${this.constructor.name}(value=${this.value})`
    }
}

/**
 * Returns {@link value} if it isn't `null` nor `undefined`. Useful where a {@link NonNullable} value is expected,
 * but the type system can't prove the value isn't nullable.
 *
 * @param value A nullable value that shouldn't be `null` or `undefined`;
 * @returns {@link value}.
 * @throws {UnwrapError} if {@link value} is `null` or `undefined`.
 */
export function unwrap<const T>(value: T | null | undefined): NonNullable<T> {
    if (value === null || value === undefined) {
        throw new UnwrapError((value === null) ? null : undefined)
    }
    return value
}
