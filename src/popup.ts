import { PopupSwitchMenuItem, type PopupMenuBase } from './gjs/ui/popupMenu.js'

/** A {@link PopupSwitchMenuItem} with type-safe, weakly bound listeners. */
export class PopupSwitch {
    /** The wrapped {@link PopupSwitchMenuItem}. */
    readonly #popup: PopupSwitchMenuItem
    /** All ids returned by {@link PopupSwitchMenuItem.connect}. */
    readonly #callbackIds: number[] = []

    /**
     * @param name The switch name.
     * @param initialState If it is starts active, defaults to `false`.
     */
    constructor(name: string, initialState: boolean = false) {
        this.#popup = new PopupSwitchMenuItem(name, initialState, { reactive: true })
        Object.freeze(this)
    }

    /**
     * Inserts this switch in a {@link PopupMenuBase}.
     */
    addTo(this: this, menu: PopupMenuBase, position?: number): void {
        if (typeof position === 'number') {
            menu.addMenuItem(this.#popup, position)
        } else {
            menu.addMenuItem(this.#popup)
        }
    }

    /** The current switch state. */
    get state(): boolean {
        return Boolean(this.#popup.state)
    }

    set state(value: boolean) {
        this.#popup.setToggleState(value)
    }

    /**
     * Add a collback as a listener for UI toggles.
     *
     * @param callback Listener callabck.
     */
    addListener(this: this, callback: (this: void) => void): void {
        const id = this.#popup.connect('toggled', callback)
        this.#callbackIds.push(id)
    }

    /**
     * Removes all the popup callbacks.
     */
    destroy(this: this): void {
        this.#callbackIds.forEach((id) => {
            log(`${this.constructor.name} ~ ${this.#popup.get_name()}: Disconnecting ID ${id}`)
            this.#popup.disconnect(id)
        })
    }
}
