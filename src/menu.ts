import { St } from './gjs/gi.js'
import main from './gjs/ui/main.js'
import { Button } from './gjs/ui/panelMenu.js'


/** Throws exception if `value` is `null` or `undefined`. */
function unwrap<T>(value: T | null | undefined): NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error(`expected value here, but got ${value}`)
    }
    return value
}

function createIndicatorButton(name: string, uuid: string): Button {
    const button = new Button(0.0, name, false)

    // create a boxed icon box for the button
    const box = new St.BoxLayout()
    box.add_actor(new St.Icon({
        icon_name: 'system-run-symbolic',
        style_class: 'system-status-icon'
    }))
    button.add_child(box)

    // insert button with icon to top bar
    const [role] = uuid.split('@')
    main.panel.addToStatusArea(unwrap(role), button)

    return button
}

export interface Menu {
    destroy(): void
}

export function addBacklightMenu(name: string, uuid: string): Menu {
    const button = createIndicatorButton(name, uuid)
    const menu = unwrap(button.menu)

    menu.connect('open-state-changed', (_, open) => {
        if (open) {
            // TODO
        }
    })

    function destroy() {
        button.destroy()
    }

    return { destroy }
}
