import { exec } from '../utils/system/exec.js'
import { findInPath } from '../utils/system/path.js'

/** Utility for modifying keymaps. */
export namespace XModMap {
    const xmodmap = findInPath('xmodmap')

    /** Sets the Scroll Lock key as modifyable, but only once. */
    export async function prepareScrollLock(): Promise<void> {
        await exec(xmodmap, '-e', 'add mod3 = Scroll_Lock')
    }
}
