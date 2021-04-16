const { St } = imports.gi
const Main = imports.ui.main
const { Button } = imports.ui.panelMenu

const Me = imports.misc.extensionUtils.getCurrentExtension()
const { exec, registerClass } = Me.imports.utils
const { Switch } = Me.imports.switch


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
        private switches: InstanceType<typeof Switch>[] = []

        // @ts-ignore
        _init(name = Me.metadata.name) {
            super._init(0.0, name, false)
            this.switches = []

            // Create icon box for top panel.
            const box = new St.BoxLayout()
            box.add_actor(new St.Icon({
                icon_name: 'system-run-symbolic',
                style_class: 'system-status-icon'
            }))
            this.add_child(box)
        }

        createSwitch<T extends InstanceType<typeof Switch>>(switchCtor: new() => T) {
            const popup = new switchCtor()
            this.menu!.addMenuItem(popup)

            this.switches.push(popup)
        }

        switchAll(state: boolean) {
            this.switches.forEach(sw => sw.switch(state))
        }

        clear() {
            this.switches.forEach(sw => sw.destroy())
            this.switches = []
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
