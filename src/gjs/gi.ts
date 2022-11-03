import type * as clutter from '@gi-types/clutter'
import type * as gio from '@gi-types/gio'
import type * as glib from '@gi-types/glib'
import type * as gobject from '@gi-types/gobject'
import type * as meta from '@gi-types/meta'
import type * as shell from '@gi-types/shell'
import type * as st from '@gi-types/st'

declare namespace imports {
    namespace gi {
        const Clutter: typeof clutter
        const Gio: typeof gio
        const GLib: typeof glib
        const GObject: typeof gobject
        const Meta: typeof meta
        const Shell: typeof shell
        const St: typeof st
    }
}

export const Clutter = imports.gi.Clutter
export type Clutter = typeof Clutter

export const Gio = imports.gi.Gio
export type Gio = typeof Gio

export const GLib = imports.gi.GLib
export type GLib = typeof GLib

export const GObject = imports.gi.GObject
export type GObject = typeof GObject

export const Meta = imports.gi.Meta
export type Meta = typeof Meta

export const Shell = imports.gi.Shell
export type Shell = typeof Shell

export const St = imports.gi.St
export type St = typeof St
