import { Clutter, St } from './gjs/gi.js'
import main from './gjs/ui/main.js'
import { Button } from './gjs/ui/panelMenu.js'
import { PopupImageMenuItem } from './gjs/ui/popupMenu.js'
import { keyboardStatus, Switch } from './switch.js'
import { exec } from './utils.js'

import type * as Metadata from './metadata.json'

class SwitchScroll extends Switch {
    constructor(name = 'Scroll Lock') {
        super(name, {
            on: ['/usr/bin/xset', 'led', 'named', 'Scroll Lock'],
            off: ['/usr/bin/xset', '-led', 'named', 'Scroll Lock']
        })
    }
}

class SwitchNum extends Switch {
    constructor(name = 'Num Lock') {
        super(name, {
            on: ['/usr/bin/numlockx', 'on'],
            off: ['/usr/bin/numlockx', 'off']
        })
    }
}

class BacklightMenu {
    private switches: Record<string, Switch>
    private button?: PopupImageMenuItem
    readonly parent: Button

    constructor(name: string) {
        this.switches = {}
        this.parent = new Button(0.0, name, false)

        // Create icon box for top panel.
        const box = new St.BoxLayout()
        box.add_actor(new St.Icon({
            icon_name: 'system-run-symbolic',
            style_class: 'system-status-icon'
        }))
        this.parent.add_child(box)

        this.parent.menu!.connect('open-state-changed', (_, open: boolean) => {
            if (open) {
                this.updateStatus()
            }
        })
    }

    addButton(onClick: (ev: typeof Clutter.Event) => void, text?: string, icon?: string) {
        const button = new PopupImageMenuItem(text, icon)
        button.connect('activate', (_, ev) => onClick(ev))

        this.button?.destroy()
        this.parent.menu!.addMenuItem(button)
        this.button = button
    }

    createSwitch<T extends Switch>(switchCtor: new() => T) {
        const popup = new switchCtor()
        const name = popup.switchName

        if (this.switches[name]) {
            throw new Error(`switch ${name} already defined`)
        }

        this.parent.menu!.addMenuItem(popup.popup)
        this.switches[name] = popup
    }

    updateStatus() {
        const status = keyboardStatus(Object.keys(this.switches))
        for (const sw in status) {
            this.switches[sw]?.switch(status[sw])
        }
    }

    switchAll(state: boolean) {
        for (const name in this.switches) {
            this.switches[name]?.switch(state)
        }
    }

    clear() {
        for (const name in this.switches) {
            this.switches[name]?.destroy()
        }
        this.switches = {}
    }

    destroy() {
        this.clear()
        this.button?.destroy()
        this.parent.destroy()
    }
}

export class BacklightExtension {
    private readonly metadata: typeof Metadata
    private indicator: BacklightMenu | null = null

    constructor(metadata: typeof Metadata) {
        this.metadata = metadata
    }

    /**
     * Prepare scroll lock for keyboard backlight control.
     */
    prepareScroll() {
        exec('/usr/bin/xmodmap', '-e', 'add mod3 = Scroll_Lock')
    }

    enable(role = 'backlight-keyboard') {
        this.prepareScroll()

        this.indicator = new BacklightMenu(this.metadata.name)
        main.panel.addToStatusArea(role, this.indicator.parent)

        this.indicator.createSwitch(SwitchScroll)
        this.indicator.createSwitch(SwitchNum)
        this.indicator.switchAll(true)

        this.indicator.addButton(this.prepareScroll, 'Reset Keymap', 'go-next')
    }

    disable() {
        this.indicator?.destroy()
        this.indicator = null
    }
}
