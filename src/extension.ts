const { St } = imports.gi
const Main = imports.ui.main
const { Button } = imports.ui.panelMenu

const Me = imports.misc.extensionUtils.getCurrentExtension()
const { exec, registerClass } = Me.imports.utils
const { Switch, keyboardStatus } = Me.imports.switch


const SwitchScroll = registerClass(
    class SwitchScroll extends Switch {
        // @ts-ignore
        _init(name = 'Scroll Lock') {
            super._init(name, {
                on: ['/usr/bin/xset', 'led', 'named', 'Scroll Lock'],
                off: ['/usr/bin/xset', '-led', 'named', 'Scroll Lock']
            })
        }
    }
)

const SwitchNum = registerClass(
    class SwitchNum extends Switch {
        // @ts-ignore
        _init(name = 'Num Lock') {
            super._init(name, {
                on: ['/usr/bin/numlockx', 'on'],
                off: ['/usr/bin/numlockx', 'off']
            })
        }
    }
)

const BacklightMenu = registerClass(
    class BacklightMenu extends Button {
        private _switches: {
            [key: string]: InstanceType<typeof Switch>
        } = {}

        // @ts-ignore
        _init(name = Me.metadata.name) {
            super._init(0.0, name, false)
            this._switches = {}

            // Create icon box for top panel.
            const box = new St.BoxLayout()
            box.add_actor(new St.Icon({
                icon_name: 'system-run-symbolic',
                style_class: 'system-status-icon'
            }))
            this.add_child(box)

            this.menu!.connect('open-state-changed', (_, open: boolean) => {
                if (open) {
                    this.updateStatus()
                }
            })
        }

        createSwitch<T extends InstanceType<typeof Switch>>(switchCtor: new() => T) {
            const popup = new switchCtor()
            const name = popup.switchName

            if (this._switches[name]) {
                throw new Error(`switch ${name} already defined`)
            }

            this.menu!.addMenuItem(popup)
            this._switches[name] = popup
        }

        updateStatus() {
            const status = keyboardStatus(Object.keys(this._switches))
            for (const sw in status) {
                this._switches[sw].setToggleState(status[sw])
            }
        }

        switchAll(state: boolean) {
            for (const name in this._switches) {
                this._switches[name].switch(state)
            }
        }

        clear() {
            for (const name in this._switches) {
                this._switches[name].destroy()
            }
            this._switches = {}
        }

        destroy() {
            this.clear()
            super.destroy()
        }
    }
)


class BacklightExtension {
    private indicator: InstanceType<typeof BacklightMenu> | null = null

    enable(name = 'backlight-keyboard') {
        // Prepare scroll lock for keyboard backlight control.
        exec('/usr/bin/xmodmap', '-e', 'add mod3 = Scroll_Lock')

        this.indicator = new BacklightMenu()
        Main.panel.addToStatusArea(name, this.indicator)

        this.indicator.createSwitch(SwitchScroll)
        this.indicator.createSwitch(SwitchNum)
        this.indicator.switchAll(true)
    }

    disable() {
        this.indicator?.destroy()
        this.indicator = null
    }
}

export function init() {
    return new BacklightExtension()
}
