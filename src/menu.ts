import St from 'gi://St'
import * as main from 'resource:///org/gnome/shell/ui/main.js'
import { Button } from 'resource:///org/gnome/shell/ui/panelMenu.js'
import type { PopupMenuBase } from 'resource:///org/gnome/shell/ui/popupMenu.js'

import { destroySubTree } from './utils/gobject.js'
import { unwrap } from './utils/types/nonnull.js'
import { weak } from './utils/types/weak.js'

import { KeyStatusReloader } from './keyboard/reloader.js'
import { type Key, NumLock, ScrollLock } from './keyboard/keys.js'

import { SwitchMenuItem } from './switch.js'
import { ResetScrollLockItem } from './reset.js'

/** The top-bar button and icon.s */
class IndicatorButton {
    readonly #id: string
    readonly #button: Button

    /**
     * @param name The button name.
     * @param uuid The extension UUID.
     */
    constructor(name: string, uuid: string) {
        this.#id = unwrap(uuid.split('@')[0])

        this.#button = new Button(0.0, name, false)
        this.#button.add_child(IndicatorButton.#boxedIcon())

        main.panel.addToStatusArea(this.#id, this.#button)
        Object.freeze(this)
    }

    /** Access the menu opened by this button. */
    get menu(): PopupMenuBase {
        return unwrap(this.#button.menu)
    }

    /** Add a listener for when the menu was opened or closed. */
    addMenuListener(this: this, callback: (this: void, _source: unknown, state: unknown) => void): void {
        this.menu.connect('open-state-changed', callback)
    }

    /** Destroys the button and all of its children. */
    destroy(this: this): void {
        destroySubTree(this.#button)
    }

    /** Creates an icon for the button. */
    static #boxedIcon(): St.BoxLayout {
        const icon = new St.Icon({
            icon_name: 'system-run-symbolic',
            style_class: 'system-status-icon'
        })

        const box = new St.BoxLayout()
        box.add_actor(icon)
        return box
    }
}

/** Options for creating the menu. */
export interface BacklightMenuOptions {
    /** Extension UUID. */
    readonly uuid: string
    /** Extension name. */
    readonly name: string
}

/** The menu, with the top panel button and its internal switches. */
export class BacklightMenu {
    readonly #reloader = new KeyStatusReloader({ seconds: 5 })
    readonly #button: IndicatorButton
    readonly #numLock: SwitchMenuItem<NumLock.Key>
    readonly #scrollLock: SwitchMenuItem<ScrollLock.Key>
    readonly #resetKeymap: ResetScrollLockItem

    constructor({ name, uuid }: BacklightMenuOptions) {
        this.#button = new IndicatorButton(name, uuid)
        this.#button.addMenuListener(this.#reloadCallback)

        this.#numLock = this.#addSwitch(NumLock.KEY)
        this.#scrollLock = this.#addSwitch(ScrollLock.KEY)
        this.#resetKeymap = new ResetScrollLockItem(this.#button.menu)

        Object.freeze(this)
        this.#reloader.reload()
    }

    #addSwitch<const S extends string>(this: this, key: Key<S>): SwitchMenuItem<S> {
        return new SwitchMenuItem(key, this.#button.menu, this.#reloader)
    }

    readonly #reloadCallback = weak(this, this.#reloadOnOpen)

    #reloadOnOpen(this: this, _: unknown, open: unknown): void {
        if (open === true) {
            this.#reloader.reload()
        }
    }

    /** Destroys the menu and all of its resources. */
    destroy(this: this): void {
        this.#reloadCallback.collect()

        this.#numLock.destroy()
        this.#scrollLock.destroy()
        this.#resetKeymap.destroy()

        this.#button.destroy()
        this.#reloader.destroy()
    }
}
