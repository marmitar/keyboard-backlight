import { exec } from '../utils/exec.js'
import { findInPath } from '../utils/path.js'

/**
 * Wrapper for the `numlockx` utility.
 *
 * @see https://github.com/rg3/numlockx
 */
export namespace NumLockX {
    /** Full path for the `numlockx` executable. */
    const numlockx = findInPath('numlockx')

    /**
     * Turns on the `NumLock` key.
     */
    export async function on() {
        await exec(numlockx, 'on')
    }

    /**
     * Turns off the `NumLock` key.
     */
    export async function off() {
        await exec(numlockx, 'off')
    }
}
