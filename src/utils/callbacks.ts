/** Functions for manipulation {@link Function} objects. */
export namespace Callbacks {
    /**
     * Rename the provided function and {@link Object.freeze}s it.
     *
     * @param func Function to be renamed.
     * @param name The new name for `func`.
     * @returns The input function `func`, but frozen with a new name.
     */
    export function freeze<const F extends (...args: any[]) => any>(func: F, name: string): F {
        const renamed = Object.defineProperty(func, 'name', {
            value: name,
            writable: false,
            enumerable: false,
            configurable: true,
        })
        return Object.freeze(renamed)
    }
}
