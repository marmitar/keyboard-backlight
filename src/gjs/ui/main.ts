import type * as Clutter from '@gi-types/clutter'
import type * as Gio from '@gi-types/gio'
import type * as Meta from '@gi-types/meta'
import type * as Shell from '@gi-types/shell'
import type * as St from '@gi-types/st'
import type { Registered } from '../register'
import type { Button } from './panelMenu'

declare namespace gjs {
    interface ModalParams {
        timestamp?: number,
        options?: Meta.ModalOptions,
        actionMode?: Shell.ActionMode
    }

    class Panel extends St.Widget {
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
}

declare namespace imports {
    namespace ui {
        namespace panel {
            const Panel: Registered<typeof gjs.Panel>
        }

        namespace main {
            const panel: InstanceType<typeof imports.ui.panel.Panel>

            function start(): void

            function getThemeStylesheet(): Gio.File | null
            function setThemeStylesheet(cssStylesheet: string | null): void
            function reloadThemeResource(): void

            function notify(msg: string, details: string): void
            function notifyError(msg: string, details: string): void

            function loadTheme(): void

            function pushModal(actor: Clutter.Actor, params?: gjs.ModalParams): boolean
            function popModal(actor: Clutter.Actor, timestamp?: number): void

            function openRunDialog(): void
            function openWelcomeDialog(): void

            function activateWindow(window: Meta.Window, time?: number, workspaceNum?: number): void

            function initializeDeferredWork(actor: Clutter.Actor, callback: () => void): string
            function queueDeferredWork(workId: string): void
        }
    }
}

export const Panel = imports.ui.panel.Panel
export type Panel = InstanceType<typeof Panel>

export const main = imports.ui.main
export default main
