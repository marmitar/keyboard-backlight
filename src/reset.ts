import { PopupImageMenuItem, type PopupMenuBase } from './gjs/ui/popupMenu.js'

import { XModMap } from './keyboard/xmodmap.js'


/** Simple wrapper around {@link PopupImageMenuItem}. */
class PopupImage {
    readonly #popup: PopupImageMenuItem
    readonly #id: number

    /**
     * @param onClick Callback called when the image is clicked.
     * @param name The button text.
     * @param icon The image for the button.
     */
    constructor(onClick: (this: void) => void, name: string, icon: string) {
        this.#popup = new PopupImageMenuItem(name, icon)
        this.#id = this.#popup.connect('activate', onClick)
        Object.freeze(this)
    }

    /**
     * Inserts this switch in a {@link PopupMenuBase}.
     */
    addTo(this: this, menu: PopupMenuBase): void {
        menu.addMenuItem(this.#popup)
    }

    /**
     * Removes all the popup callbacks.
     */
    destroy(this: this): void {
        log(`${this.constructor.name} ~ ${this.#popup.get_name()}: Disconnecting ID ${this.#id}`)
        this.#popup.disconnect(this.#id)
    }
}

/** A button that calls {@link XModMap.prepareScrollLock} when clicked. */
export class ResetScrollLockItem {
    readonly #popup: PopupImage

    /**
     * @param menu The current top-panel menu.
     */
    constructor(menu: PopupMenuBase) {
        const name = 'Reset Keymap'
        const icon = 'go-next'

        this.#popup = new PopupImage(XModMap.prepareScrollLock, name, icon)
        this.#popup.addTo(menu)
    }

    /** Remove the popup and all of its resources. */
    destroy(this: this): void {
        this.#popup.destroy()
    }
}
