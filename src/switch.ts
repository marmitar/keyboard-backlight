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

    constructor(name: string, args?: ExecArgs) {
        this.args = args ?? {}
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

    switch(state?: boolean) {
        if (state ?? !this.popup.state) {
            this.run(this.args.on)
            this.popup.setToggleState(true)
        } else {
            this.run(this.args.off)
            this.popup.setToggleState(false)
        }
    }

    destroy() {
        this.popup.destroy()
    }
}

export function keyboardStatus<K extends string>(keys: K[]): Record<K, boolean | never> {
    const { stdout } = exec('/usr/bin/xset', 'q')
    const re = new RegExp(`(${keys.join('|')}):\\s+(on|off)`, 'g')

    const matches: any = {}
    for (const [_, name, status] of stdout.matchAll(re)) {
        matches[name as K] = (status == 'on')
    }
    return matches
}
