import type St from 'gi://St'
import type { Registered } from '../register'
import type { PopupMenuBase } from './popupMenu'

declare namespace gjs {
    interface Params {
        style_class?: string,
        x_expand?: boolean,
        y_expand?: boolean
    }

    class ButtonBox extends St.Widget {
        container: St.Bin<this>

        _init(params?: Params): void
        get actor(): this
    }

    class Button extends imports.ui.panelMenu.ButtonBox {
        menu?: PopupMenuBase | null

        _init(menuAlignment: number, nameText?: string, dontCreateMenu?: boolean): void
        setSensitive(sensitive: boolean): void
        setMenu(menu?: PopupMenuBase): void
    }
}

declare namespace imports {
    namespace ui {
        namespace panelMenu {
            const ButtonBox: Registered<typeof gjs.ButtonBox>
            const Button: Registered<typeof gjs.Button>
        }
    }
}

export const ButtonBox = imports.ui.panelMenu.ButtonBox
export type ButtonBox = InstanceType<typeof ButtonBox>

export const Button = imports.ui.panelMenu.Button
export type Button = InstanceType<typeof Button>
