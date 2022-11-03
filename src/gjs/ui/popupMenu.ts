import type * as Clutter from '@gi-types/clutter'
import type * as Gio from '@gi-types/gio'
import type * as St from '@gi-types/st'
import type { BooleanProps, Registered } from '../register'

declare namespace st {
    interface Params {
        reactive?: boolean,
        activate?: boolean,
        hover?: boolean,
        style_class?: string,
        can_focus?: boolean
    }

    class PopupBaseMenuItem extends St.BoxLayout {
        _init(params?: Params): void
        get actor(): this

        activate(event: Clutter.Event): void
        setSesitive(sensitive: boolean): void
    }

    class PopupMenuItem extends imports.ui.popupMenu.PopupBaseMenuItem {
        label: St.Label
        label_actor: St.Label

        _init(text?: string, params?: Params): void
    }

    class PopupSeparatorMenuItem extends imports.ui.popupMenu.PopupBaseMenuItem {
        label: St.Label
        label_actor: St.Label

        _init(text?: string): void
    }

    const StBin: Registered<typeof St.Bin>
    class Switch extends StBin {
        _init(state?: boolean): void
        toogle(): void
    }

    class PopupSwitchMenuItem extends imports.ui.popupMenu.PopupBaseMenuItem {
        label: St.Label
        label_actor: St.Label

        _init(text?: string, active?: boolean, params?: Params): void
        setStatus(text?: string): void
        toggle(): void
        get state(): boolean
        setToggleState(state: boolean): void
        checkAccessibleState(): void
    }

    class PopupImageMenuItem extends imports.ui.popupMenu.PopupBaseMenuItem {
        label: St.Label
        label_actor: St.Label

        _init(text?: string, icon?: Gio.Icon | string, params?: Params): void
        setIcon(icon: Gio.Icon | string): void
    }
}

declare namespace clutter {
    abstract class PopupMenuBase<A extends Clutter.Actor = Clutter.Actor>  {
        sourceActor: A
        focusActor: A
        box: St.BoxLayout
        isOpen: boolean

        constructor(sourceActor: A, styleClass?: string)
        getSensitive(): boolean
        setSensitive(sensitive: boolean): void
        get sensitive(): boolean
        set sensitive(sensitive: boolean)
        addAction(title: string, callback: (event: Clutter.Event) => void, icon: St.Icon): PopupBaseMenuItem
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

        connect(id: string, callback: (...args: any[]) => void): void
        disconnect(): boolean
        emit(signal: string, ...data: any[]): void
    }

    class PopupMenu<A extends Clutter.Actor = Clutter.Actor> extends PopupMenuBase<A> {
        actor: Clutter.Actor

        constructor(sourceActor: A, arrowAlignment: number, arrowSide: St.Side)
        setArrowOrigin(origin: number): void
        setSourceAlignment(alignment: number): void
        open(animate?: boolean): void
        close(animate?: boolean): void
        destroy(): void
    }

    class PopupDummyMenu<A extends Clutter.Actor = Clutter.Actor> {
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
}

declare namespace imports {
    namespace ui {
        namespace popupMenu {
            const PopupBaseMenuItem: Registered<typeof st.PopupBaseMenuItem, BooleanProps<'active' | 'sensitive'>>
            const PopupMenuItem: Registered<typeof st.PopupMenuItem>
            const PopupSeparatorMenuItem: Registered<typeof st.PopupSeparatorMenuItem>
            const Switch: Registered<typeof st.Switch, BooleanProps<'state'>>
            const PopupSwitchMenuItem: Registered<typeof st.PopupSwitchMenuItem>
            const PopupImageMenuItem: Registered<typeof st.PopupImageMenuItem>
            const PopupMenuBase: typeof clutter.PopupMenuBase
            const PopupMenu: typeof clutter.PopupMenu
            const PopupDummyMenu: typeof clutter.PopupDummyMenu
        }
    }
}

export const PopupBaseMenuItem = imports.ui.popupMenu.PopupBaseMenuItem
export type PopupBaseMenuItem = InstanceType<typeof PopupBaseMenuItem>

export const PopupMenuItem = imports.ui.popupMenu.PopupMenuItem
export type PopupMenuItem = InstanceType<typeof PopupMenuItem>

export const PopupSeparatorMenuItem = imports.ui.popupMenu.PopupSeparatorMenuItem
export type PopupSeparatorMenuItem = typeof PopupSeparatorMenuItem

export const Switch = imports.ui.popupMenu.Switch
export type Switch = InstanceType<typeof Switch>

export const PopupSwitchMenuItem = imports.ui.popupMenu.PopupSwitchMenuItem
export type PopupSwitchMenuItem = InstanceType<typeof PopupSwitchMenuItem>

export const PopupImageMenuItem = imports.ui.popupMenu.PopupImageMenuItem
export type PopupImageMenuItem = InstanceType<typeof PopupImageMenuItem>

export const PopupMenuBase = imports.ui.popupMenu.PopupMenuBase
export type PopupMenuBase = InstanceType<typeof PopupMenuBase>

export const PopupMenu = imports.ui.popupMenu.PopupMenu
export type PopupMenu = InstanceType<typeof PopupMenu>

export const PopupDummyMenu = imports.ui.popupMenu.PopupDummyMenu
export type PopupDummyMenu = InstanceType<typeof PopupDummyMenu>
