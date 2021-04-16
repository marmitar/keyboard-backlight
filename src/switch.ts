const { PopupSwitchMenuItem } = imports.ui.popupMenu

const Me = imports.misc.extensionUtils.getCurrentExtension()
const { exec, registerClass } = Me.imports.utils


type NonEmpty<T> = [T, ...T[]]

type ExecArgs = {
    on?: NonEmpty<string>,
    off?: NonEmpty<string>,
}

export const Switch = registerClass(
    class Switch extends PopupSwitchMenuItem {
        private _args: ExecArgs = {}
        private _switch_name: string = ""

        // @ts-ignore
        _init(name: string, args?: ExecArgs) {
            super._init(name, false, { reactive: true })
            this._args = args ?? {}
            this._switch_name = name

            this.connect('toggled', (_, state) => {
                this.switch(state)
            })
        }

        get switchName(): string {
            return this._switch_name
        }

        private _exec(cmd?: NonEmpty<string>) {
            if (cmd) {
                exec(...cmd)
            }
        }

        switch(state?: boolean) {
            if (state ?? !this.state) {
                this._exec(this._args.on)
                this.setToggleState(true)
            } else {
                this._exec(this._args.off)
                this.setToggleState(false)
            }
        }
    }
)

export function keyboardStatus<K extends string>(keys: K[]): Record<K, boolean | never> {
    const { stdout } = exec('/usr/bin/xset', 'q')
    const re = new RegExp(`(${keys.join('|')}):\\s+(on|off)`, 'g')

    const matches: any = {}
    for (const [_, name, status] of stdout.matchAll(re)) {
        matches[name as K] = (status == 'on')
    }
    return matches
}
