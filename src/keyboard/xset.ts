import { exec } from '../utils/exec.js'
import { findInPath } from '../utils/path.js'

/**
 * Wrapper for the `xset` utility.
 *
 * @see https://man.archlinux.org/man/extra/xorg-xset/xset.1.en
 */
export namespace XSet {
    /** Full path for the `xset` executable. */
    const xset = findInPath('xset')

    /**
     * Returns information about the current setting for the keyboard.
     *
     * @returns The `xset` output.
     *
     * @see https://man.archlinux.org/man/extra/xorg-xset/xset.1.en#q
     */
    export async function query(): Promise<string> {
        return await exec(xset, 'q')
    }

    /**
     * Turns on a keyboard led by its `xset` name.
     *
     * @param name The key name associated with a led.
     *
     * @see https://man.archlinux.org/man/extra/xorg-xset/xset.1.en#led
     */
    export async function on(name: string) {
        await exec(xset, 'led', 'named', name)
    }

    /**
     * Turns off a keyboard led by its `xset` name.
     *
     * @param name The key name associated with a led.
     *
     * @see https://man.archlinux.org/man/extra/xorg-xset/xset.1.en#led
     */
    export async function off(name: string) {
        await exec(xset, '-led', 'named', name)
    }
}
