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
