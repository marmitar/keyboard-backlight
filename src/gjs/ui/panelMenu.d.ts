import { Registered, St } from '../register'
import { PopupMenuBase } from './popupMenu'


export interface Params {
    style_class?: string,
    x_expand?: boolean,
    y_expand?: boolean
}


declare class _ButtonBox extends St.Widget {
    container: St.Bin<this>

    _init(params?: Params): void
    get actor(): this
}
export const ButtonBox: Registered<typeof _ButtonBox>


declare class PanelMenuButton extends ButtonBox {
    menu?: PopupMenuBase | null

    _init(menuAlignment: number, nameText?: string, dontCreateMenu?: boolean): void
    setSensitive(sensitive: boolean): void
    setMenu(menu?: PopupMenuBase): void
}
export const Button: Registered<typeof PanelMenuButton>
