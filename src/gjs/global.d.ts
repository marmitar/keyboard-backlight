function log(msg: string | any): void
function logError(error: Error, prefix?: string): void

declare module 'gi://Clutter' {
    export * from '@gi-types/clutter'
}

declare module 'gi://Gio' {
    export * from '@gi-types/gio'
}

declare module 'gi://GLib' {
    export * from '@gi-types/glib'
}

declare module 'gi://GObject' {
    export * from '@gi-types/gobject'

    type ProblematicKeys = '_init' | 'connect_after' | 'container'
    type Sanitized<T extends Constructor>
        = new (...args: ConstructorParameters<T>) => Omit<InstanceType<T>, ProblematicKeys>

    type Constructor<T = {}> = new(...args: readonly any[]) => T

    type ParamSpecs = {
        [key: string]: ParamSpec
    }

    type GObject<T = any> = {
        $gtype: GType<T>
    }

    export type Registered<
        T extends Constructor,
        P extends ParamSpecs = {},
        I extends GObject[] = [],
    > = Sanitized<import('@gi-types/gobject').RegisteredClass<T, P, I>>
}

declare module 'gi://Meta' {
    export * from '@gi-types/meta'
}

declare module 'gi://Shell' {
    export * from '@gi-types/shell'
}

declare module 'gi://St' {
    export * from '@gi-types/st'
}

declare module 'resource:///org/gnome/shell/ui/main.js' {
    import type { Panel } from 'resource:///org/gnome/shell/ui/panel.js'
    import Clutter from 'gi://Clutter'
    import Gio from 'gi://Gio'
    import Meta from 'gi://Meta'
    import Shell from 'gi://Shell'

    export const panel: Panel

    export function start(): void

    export function getThemeStylesheet(): Gio.File | null
    export function setThemeStylesheet(cssStylesheet: string | null): void
    export function reloadThemeResource(): void

    export function notify(msg: string, details: string): void
    export function notifyError(msg: string, details: string): void

    export function loadTheme(): void

    export function pushModal(actor: Clutter.Actor, params?: {
        timestamp?: number,
        options?: Meta.ModalOptions,
        actionMode?: Shell.ActionMode
    }): boolean
    export function popModal(actor: Clutter.Actor, timestamp?: number): void

    export function openRunDialog(): void
    export function openWelcomeDialog(): void

    export function activateWindow(window: Meta.Window, time?: number, workspaceNum?: number): void

    export function initializeDeferredWork(actor: Clutter.Actor, callback: () => void): string
    export function queueDeferredWork(workId: string): void
}

declare module 'resource:///org/gnome/shell/ui/panel.js' {
    import type { Registered } from 'gi://GObject'
    import type { Button } from 'resource:///org/gnome/shell/ui/panelMenu.js'
    import St from 'gi://St'

    class _Panel extends St.Widget {
        _init(): void
        toggleAppMenu(): void
        toggleCalendar(): void
        closeCalendar(): void
        set boxOpacity(value: number)
        get boxOpacity(): number
        addToStatusArea<T extends Button>(
            role: string,
            indicator: T,
            position?: number,
            box?: 'left' | 'center' | 'right'
        ): T
    }

    export const Panel: Registered<typeof _Panel>
    export type Panel = InstanceType<typeof Panel>
}

declare module 'resource:///org/gnome/shell/ui/panelMenu.js' {
    import type { Registered } from 'gi://GObject'
    import type { PopupMenuBase } from 'resource:///org/gnome/shell/ui/popupMenu.js'
    import St from 'gi://St'

    class _ButtonBox extends St.Widget {
        container: St.Bin<this>

        _init(params?: {
            style_class?: string,
            x_expand?: boolean,
            y_expand?: boolean
        }): void
        get actor(): this
    }

    export const ButtonBox: Registered<typeof _ButtonBox>
    export type ButtonBox = InstanceType<typeof ButtonBox>

    class _Button extends ButtonBox {
        menu?: PopupMenuBase | null

        _init(menuAlignment: number, nameText?: string, dontCreateMenu?: boolean): void
        setSensitive(sensitive: boolean): void
        setMenu(menu?: PopupMenuBase): void
    }

    export const Button: Registered<typeof _Button>
    export type Button = InstanceType<typeof Button>
}

declare module 'resource:///org/gnome/shell/ui/popupMenu.js' {
    import type { ParamSpecBoolean, Registered } from 'gi://GObject'
    import Clutter from 'gi://Clutter'
    import Gio from 'gi://Gio'
    import St from 'gi://St'

    class _PopupBaseMenuItem extends St.BoxLayout {
        _init(params?: {
            reactive?: boolean,
            activate?: boolean,
            hover?: boolean,
            style_class?: string,
            can_focus?: boolean
        }): void
        get actor(): this

        activate(event: Clutter.Event): void
        setSesitive(sensitive: boolean): void
    }

    export const PopupBaseMenuItem: Registered<typeof _PopupBaseMenuItem, {
        active: ParamSpecBoolean
        sensitive: ParamSpecBoolean
    }>
    export type PopupBaseMenuItem = InstanceType<typeof PopupBaseMenuItem>

    class _PopupMenuItem extends PopupBaseMenuItem {
        label: St.Label
        label_actor: St.Label

        _init(text?: string, params?: {
            reactive?: boolean,
            activate?: boolean,
            hover?: boolean,
            style_class?: string,
            can_focus?: boolean
        }): void
    }

    export const PopupMenuItem: Registered<typeof _PopupMenuItem>
    export type PopupMenuItem = InstanceType<typeof PopupBaseMenuItem>

    class _PopupSeparatorMenuItem extends PopupBaseMenuItem {
        label: St.Label
        label_actor: St.Label

        _init(text?: string): void
    }

    export const PopupSeparatorMenuItem: Registered<typeof _PopupSeparatorMenuItem>
    export type PopupSeparatorMenuItem = InstanceType<typeof PopupSeparatorMenuItem>

    const _StBin: Registered<typeof St.Bin>

    class _Switch extends _StBin {
        _init(state?: boolean): void
        toogle(): void
    }

    export const Switch: Registered<typeof _Switch, {
        state: ParamSpecBoolean
    }>
    export type Switch = IntanceType<typeof Switch>

    class _PopupSwitchMenuItem extends PopupBaseMenuItem {
        label: St.Label
        label_actor: St.Label

        _init(text?: string, active?: boolean, params?: Params): void
        setStatus(text?: string): void
        toggle(): void
        get state(): boolean
        setToggleState(state: boolean): void
        checkAccessibleState(): void
    }

    export const PopupSwitchMenuItem: Registered<typeof _PopupSwitchMenuItem>
    export type PopupSwitchMenuItem = IntanceType<typeof PopupSwitchMenuItem>

    class _PopupImageMenuItem extends PopupBaseMenuItem {
        label: St.Label
        label_actor: St.Label

        _init(text?: string, icon?: Gio.Icon | string, params?: Params): void
        setIcon(icon: Gio.Icon | string): void
    }

    export const PopupImageMenuItem: Registered<typeof _PopupImageMenuItem>
    export type PopupImageMenuItem = InstanceType<typeof PopupImageMenuItem>

    export abstract class PopupMenuBase<A extends Clutter.Actor = Clutter.Actor>  {
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

    export class PopupMenu<A extends Clutter.Actor = Clutter.Actor> extends PopupMenuBase<A> {
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
}
