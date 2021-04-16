import * as metadata from '../metadata.json'

interface CurrentExtension {
    metadata: typeof metadata,
    imports: {
        utils: typeof import('../utils')
    }
}


export type byteArray = Uint8Array

export module gi {
    export const Clutter: typeof import('@gi-types/clutter')
    export const Gio: typeof import('@gi-types/gio')
    export const GLib: typeof import('@gi-types/glib')
    export const GObject: typeof import('@gi-types/gobject')
    export const Meta: typeof import('@gi-types/meta')
    export const Shell: typeof import('@gi-types/shell')
    export const St: typeof import('@gi-types/st')
}

export module misc {
    export module extensionUtils {
        export function getCurrentExtension(): CurrentExtension
    }
}

export * as ui from './ui'
