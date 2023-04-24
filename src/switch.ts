import type { PopupMenuBase } from './gjs/ui/popupMenu.js'

import { weak } from './utils/weak.js'

import type { Key } from './keyboard/keys.js'
import type { KeyStatusReloader } from './keyboard/reloader.js'
import { KeyState } from './keyboard/state.js'
import type { Status } from './keyboard/status.js'

import { PopupSwitch } from './popup.js'

/** Base class for a switch item. */
export class SwitchMenuItem<const S extends string> {
    readonly #popup: PopupSwitch
    readonly #key: KeyState<S>

    /**
     * @param key The key controls.
     * @param menu The current top-panel menu.
     * @param reloader Keyboard state auto-reloader.
     */
    constructor(key: Key<S>, menu: PopupMenuBase, reloader: KeyStatusReloader) {
        this.#popup = new PopupSwitch(key.name, true)
        this.#popup.addTo(menu)

        this.#key = new KeyState(key)

        this.#popup.addListener(this.#popupCallback)
        reloader.addListener(key.name, this.#keyboardCallback)

        Object.freeze(this)
    }

    /**
     * Tries to set the keyboard state to the popup state.
     *
     * @param keyState The current keyboard state, if known.
     */
    async #updateKeyState(this: this, keyState: boolean | undefined): Promise<void> {
        if (keyState !== undefined && keyState === this.#popup.state) {
            return
        }

        try {
            await this.#key.set(this.#popup.state)
        } catch (exception) {
            log(`${this.constructor.name}: ${exception}`)
            if (exception instanceof Error) {
                logError(exception, this.constructor.name)
            }
        }

        const currentState = await this.#key.get()
        if (this.#popup.state !== currentState) {
            this.#popup.state = currentState
        }
    }

    readonly #popupCallback = weak(this, this.#onPopupUpdate)

    /** Update keyboard state after popup update. */
    async #onPopupUpdate(this: this): Promise<void> {
        await this.#updateKeyState(undefined)
    }

    readonly #keyboardCallback = weak(this, this.#onKeyboardUpdate)

    /** Update keyboard state if it changed. */
    async #onKeyboardUpdate(this: this, status: Status): Promise<void> {
        await this.#updateKeyState(status.state === 'on')
    }

    /** Destroys the popup object. */
    destroy(this: this): void {
        this.#popup.destroy()
        this.#key.remove()

        this.#popupCallback.collect()
        this.#keyboardCallback.collect()
    }
}
