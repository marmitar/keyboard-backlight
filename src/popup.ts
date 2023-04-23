import { PopupSwitchMenuItem, type PopupMenuBase } from './gjs/ui/popupMenu.js'

import { Callbacks } from './utils/callbacks.js'
import { Objects } from './utils/objects.js'
import { collected, weak, type WeakCallback } from './utils/weak.js'

import { Node } from './node.js'

/** Represents a listener to user interactions in {@link PopupSwitch}. */
export interface SwitchListener {
    /** Removes the listener. */
    readonly remove: (this: void) => boolean
}

namespace SwitchListener {
    /** A weak callback being used as a listener. */
    export type WeakListener = WeakCallback<(state: boolean) => unknown>

    /** Receives the update from {@link PopupSwitchMenuItem.connect} and translates into a boolean. */
    export function onUpdate(this: WeakListener, _source: unknown, state: unknown): void {
        if (typeof state === 'string') {
            this(state === 'on')
        } else {
            this(Boolean(state))
        }
    }

    /**
     * Removes a listener received via `this` from the {@link PopupSwitchMenuItem} behind `disconnect.
     *
     * @param disconnect Weakly bound version of {@link PopupSwitchMenuItem.disconnect}.
     * @param id Callback ID returned by {@link PopupSwitchMenuItem.connect}.
     * @returns `true` if a call to `disconnect` was made successfully, `false` if `this` or `disconnected` has been
     *  collected.
     */
    export function remove(this: WeakListener, disconnect: WeakCallback<(id: number) => void>, id: number): boolean {
        if (!this[collected]) {
            const result = disconnect(id)
            this.collect()
            return result !== collected
        } else {
            return false
        }
    }

    /**
     * Creates a {@link SwitchListener} from its `remove` callback.
     *
     * @param remove The function to remove the listener.
     * @param name New name for the listener callback.
     * @returns A frozen {@link SwitchListener}.
     */
    export function create(remove: (this: void) => boolean, name: string): SwitchListener {
        return Objects.create({
            remove: {
                value: Callbacks.freeze(remove, `remove ${name}`),
                enumerable: true,
                writable: false,
                configurable: false,
            }
        })
    }
}

/** A {@link PopupSwitchMenuItem} with type-safe, weakly bound listeners. */
export class PopupSwitch {
    /** The wrapped {@link PopupSwitchMenuItem}. */
    private readonly popup: PopupSwitchMenuItem
    /** A weakly bound {@link PopupSwitchMenuItem.disconnect}. */
    private readonly disconnect: WeakCallback<(id: number) => void>

    /**
     * @param name The switch name.
     * @param initialState If it is starts active, defaults to `false`.
     */
    constructor(name: string, initialState: boolean = false) {
        this.popup = new PopupSwitchMenuItem(name, initialState, { reactive: true })
        this.disconnect = weak(this.popup, this.popup.disconnect)
        Object.freeze(this)
    }

    /**
     * Inserts this switch in a {@link PopupMenuBase}.
     */
    addTo(this: this, menu: PopupMenuBase, position?: number): void {
        menu.addMenuItem(this.popup, position)
    }

    /** The current switch state. */
    get state(): boolean {
        return Boolean(this.popup.state)
    }

    set state(value: boolean) {
        this.popup.setToggleState(value)
    }

    /**
     * Creates a {@link WeakCallback} and set it as a listener for UI toggles.
     *
     * @param data Internal data to be passed to `cb` via `this` parameter.
     * @param cb Listener callabck.
     * @returns A reference so the listener can be removed.
     */
    addListener<T extends object>(this: this, data: T, cb: (this: T, state: boolean) => void): SwitchListener {
        const weakCb = weak(data, cb)

        const onUpdate = SwitchListener.onUpdate.bind(weakCb)
        const id = this.popup.connect('toggled', Callbacks.freeze(onUpdate, cb.name))

        const remove = SwitchListener.remove.bind(weakCb, this.disconnect, id)
        return SwitchListener.create(remove, cb.name)
    }

    /**
     * Destroys the popup element.
     */
    destroy(this: this): void {
        this.disconnect.collect()
        Node.destroy(this.popup)
    }
}
