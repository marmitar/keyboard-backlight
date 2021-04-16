import { BooleanProps, Registered, St, Instance } from '../register'
import * as Gio from '@gi-types/gio'
import * as Clutter from '@gi-types/clutter'


export interface Params {
    reactive?: boolean,
    activate?: boolean,
    hover?: boolean,
    style_class?: string,
    can_focus?: boolean
}


declare class _PopupBaseMenuItem extends St.BoxLayout {
    _init(params?: Params): void
    get actor(): this

    activate(event: Clutter.Event): void
    setSesitive(sensitive: boolean): void
}
type PopupBaseMenuItemCtor = Registered<typeof _PopupBaseMenuItem, BooleanProps<'active' | 'sensitive'>>
export const PopupBaseMenuItem: PopupBaseMenuItemCtor
export type PopupBaseMenuItem = Instance<PopupBaseMenuItemCtor>


declare class _PopupMenuItem extends PopupBaseMenuItem {
    label: St.Label
    label_actor: St.Label

    _init(text?: string, params?: Params): void
}
export const PopupMenuItem: Registered<typeof _PopupMenuItem>


declare class _PopupSeparatorMenuItem extends PopupBaseMenuItem {
    label: St.Label
    label_actor: St.Label

    _init(text?: string): void
}
export const PopupSeparatorMenuItem: Registered<typeof _PopupSeparatorMenuItem>


declare class _Switch extends St.Bin {
    _init(state?: boolean): void
    toogle(): void
}
export const Switch: Registered<typeof _Switch, BooleanProps<'state'>>


declare class _PopupSwitchMenuItem extends PopupBaseMenuItem {
    label: St.Label
    label_actor: St.Label

    _init(text?: string, active?: boolean, params?: Params): void
    setStatus(text?: string)
    toggle(): void
    get state(): boolean
    setToggleState(state: boolean): void
    checkAccessibleState(): void
}
export const PopupSwitchMenuItem: Registered<typeof _PopupSwitchMenuItem>


declare class _PopupImageMenuItem extends PopupBaseMenuItem {
    label: St.Label
    label_actor: St.Label

    _init(text?: string, icon?: Gio.Icon | string, params?: Params): void
    setIcon(icon: Gio.Icon | string): void
}
export const PopupImageMenuItem: Registered<typeof _PopupImageMenuItem>


export abstract class PopupMenuBase<A extends Clutter.Actor = Clutter.Actor> {
    sourceActor: A
    focusActor: A
    box: St.BoxLayout
    isOpen: boolean

    constructor(sourceActor: A, styleClass?: string)
    getSensitive(): boolean
    setSensitive(sensitive: boolean): void
    get sensitive(): boolean
    set sensitive(sensitive: boolean)
    addAction(title: string, callback: (event: Clutter.Event) => void, icon): PopupBaseMenuItem
    addSettingsAction(title: string, desktopFile: string): PopupBaseMenuItem
    isEmpty(): boolean
    itemActivated(animate?: boolean): void
    moveMenuItem(menuItem: PopupBaseMenuItem, position: number): void
    addMenuItem(menuItem: PopupBaseMenuItem, position?: number): void
    get firstMenuItem(): PopupBaseMenuItem | null
    get numMenuItems(): number
    removeAll(): void
    toggle(): void
    destroy(): void

    // Signals.addSignalMethods
    connect(id: string, callback: (...args: any[]) => void): void
    disconnect(): boolean
    emit(signal: string, ...data: any[]): void
}

export class PopupMenu<A extends Clutter.Actor = Clutter.Actor> {
    actor: Clutter.Actor

    constructor(sourceActor: A, arrowAlignment: number, arrowSide: St.Side)
    setArrowOrigin(origin: number): void
    setSourceAlignment(alignment: number): void
    open(animate?: boolean): void
    close(animate?: boolean): void
    destroy(): void
}

export class PopupDummyMenu<A extends Clutter.Actor = Clutter.Actor> {
    sourceActor: A
    actor: A

    constructor(sourceActor: A)
    getSensitive(): boolean
    get sensitive(): boolean
    open(): void
    close(): void
    toggle(): void
    destroy(): void
}
