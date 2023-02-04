import { PopupSwitchMenuItem } from './gjs/ui/popupMenu.js'
import { exec } from './utils.js'

type NonEmpty<T> = [T, ...T[]]

type ExecArgs = {
    on?: NonEmpty<string>,
    off?: NonEmpty<string>,
}

export class Switch {
    private readonly args: ExecArgs
    readonly popup: PopupSwitchMenuItem
    readonly switchName: string

    constructor(name: string, args: ExecArgs = {}) {
        this.args = args
        this.switchName = name
        this.popup = new PopupSwitchMenuItem(name, false, { reactive: true })

        this.popup.connect('toggled', (_, state) => {
            this.switch(state)
        })
    }

    private run(cmd?: NonEmpty<string>) {
        if (cmd) {
            exec(...cmd)
        }
    }

    private set(state: boolean) {
        this.run(state ? this.args.on : this.args.off)
        this.popup.setToggleState(state)
    }

    switch(state: boolean = !this.popup.state) {
        this.set(state)
    }

    update(state: boolean = this.popup.state) {
        this.set(state)
    }

    destroy() {
        this.popup.destroy()
    }
}

export function keyboardStatus(...keys: string[]): Map<string, string | undefined> {
    const { stdout } = exec('/usr/bin/xset', 'q')
    const re = new RegExp(`(${keys.join('|')}):\\s+(on|off)`, 'g')

    const matches = new Map<string, string | undefined>()
    for (const [_, name, status] of stdout.matchAll(re)) {
        matches.set(name ?? '', status)
    }
    return matches
}
