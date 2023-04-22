import { St } from './gjs/gi.js'
import main from './gjs/ui/main.js'
import { Button } from './gjs/ui/panelMenu.js'

import { Callbacks } from './utils/callbacks.js'
import { unwrap } from './utils/nonnull.js'
import { Objects } from './utils/objects.js'
import { weak } from './utils/weak.js'

import { KeyStatusReloader } from './keyboard/reloader.js'

import { Node } from './node.js'

/**
 * Creates a button with an icon and inserts at the top bar.
 *
 * @param name The button name.
 * @param uuid The extension UUID.
 * @returns The newly created button.
 */
function createIndicatorButton(name: string, uuid: string): Button {
    const button = new Button(0.0, name, false)

    // create a boxed icon box for the button
    const box = new St.BoxLayout()
    box.add_actor(new St.Icon({
        icon_name: 'system-run-symbolic',
        style_class: 'system-status-icon'
    }))
    button.add_child(box)

    // insert button with icon into the top bar
    const [role] = uuid.split('@')
    main.panel.addToStatusArea(unwrap(role), button)

    return button
}

/** Callback invoked when the menu change to its open state. */
function reloadOnMenuOpen(this: KeyStatusReloader, _: unknown, open: unknown) {
    if (open === true) {
        this.reload()
    }
}

/** Represents the menu on the top bar. */
export interface Menu {
    /** Removes the menu and destroy associated resources. */
    readonly destroy: (this: void) => void
}

/** Options for creating the menu. */
export interface BacklightMenuOptions {
    /** Extension UUID. */
    readonly uuid: string
    /** Extension name. */
    readonly name: string
}

/**
 * Creates a button on the top bar that opens a menu for interacting with the extension.
 *
 * @returns A reference to the menu so it can be removed.
 */
export function addBacklightMenu({ name, uuid }: BacklightMenuOptions): Menu {
    const button = createIndicatorButton(name, uuid)
    const menu = unwrap(button.menu)

    const reloader = new KeyStatusReloader()
    menu.connect('open-state-changed', weak(reloader, reloadOnMenuOpen));

    reloader.addCallback('Scroll Lock', button, ({ name, id, state }) => {
        log(`Update: ${name} [${id}] = ${state}`)
    })

    function destroy() {
        reloader.clear()
        Node.destroy(button)
    }

    return Objects.create({
        destroy: {
            value: Callbacks.freeze(destroy, 'destroy BacklightMenu'),
            enumerable: true,
            configurable: false,
            writable: false,
        }
    })
}
