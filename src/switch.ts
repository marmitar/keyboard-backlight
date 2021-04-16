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
        private args: ExecArgs = {}

        // @ts-ignore
        _init(name: string, args?: ExecArgs) {
            super._init(name, false, { reactive: true })
            this.args = args ?? {}

            this.connect('toggled', (_, state) => {
                this.switch(state)
            })
        }

        private _exec(cmd?: NonEmpty<string>) {
            if (cmd) {
                exec(...cmd)
            }
        }

        switch(state?: boolean) {
            log(`[BACKLIGHTER]: switch ${this}`)
            if (state ?? !this.state) {
                this._exec(this.args.on)
                this.setToggleState(true)
            } else {
                this._exec(this.args.off)
                this.setToggleState(false)
            }
        }
    }
)
