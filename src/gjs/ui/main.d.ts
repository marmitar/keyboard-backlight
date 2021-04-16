import * as Clutter from '@gi-types/clutter'
import * as Gio from '@gi-types/gio'
import * as Meta from '@gi-types/meta'
import * as Shell from '@gi-types/shell'
import { Panel } from './panel'


export interface Params {
    timestamp?: number,
    options?: Meta.ModalOptions,
    actionMode?: Shell.ActionMode
}

export const panel: InstanceType<typeof Panel>

export function start(): void

export function getThemeStylesheet(): Gio.File | null
export function setThemeStylesheet(cssStylesheet: string | null): void
export function reloadThemeResource(): void

export function notify(msg: string, details: string): void
export function notifyError(msg: string, details: string): void

export function loadTheme(): void

export function pushModal(actor: Clutter.Actor, params?: Params): boolean
export function popModal(actor: Clutter.Actor, timestamp?: number): void

export function openRunDialog(): void
export function openWelcomeDialog(): void

export function activateWindow(window: Meta.Window, time?: number, workspaceNum:? number): void

export function initializeDeferredWork(actor: Clutter.Actor, callback: () => void): string
export function queueDeferredWork(workId: string): void
