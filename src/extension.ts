import type { Menu } from './menu.js'

/** Represents an extension that can be enabled or disabled by the GNOME Shell. */
export interface Extension {
    /** Creates UI elements and acquire resource for the extension. */
    readonly enable: (this: void) => void
    /** Remove the extension from UI and release resources. */
    readonly disable: (this: void) => void
}

/** Prepare the extension to be loaded. The extension is only enabled after a call to {@link Extension.enable}. */
export function init(meta: typeof import('./metadata.json')): Extension {
    // prefix used in exception logs
    const [extesionTag] = meta.uuid.split('@')

    /** This function is used only for logging errors in the extension Promises. */
    function logException(exception: unknown) {
        log(`${extesionTag}: ${exception}`)
        // for actual errors, also log with backtrace
        if (exception instanceof Error) {
            logError(exception, extesionTag)
        }
    }

    // dynamic imports are the only way to use 'import' in GJS
    const menuModule = import('./menu.js')
    // if 'enable' is called more than once, we need to store all the menus here
    const menus: Promise<Menu | void>[]  = []

    /**
     * GJS expects this to be synchronous, but this function has to be async (via promises) because of the
     * dynamic import in {@link menuModule}. Otherwise, we would need to use GNOME's `imports` object, while
     * every modern JS system uses ES6 modules.
     */
    function enable() {
        log(`Enabling ${meta.uuid}`)

        const menu = menuModule
            .then(({ addBacklightMenu }) => addBacklightMenu(meta))
            .catch(logException)

        menus.push(menu)
    }

    function disable() {
        log(`Disabling ${meta.uuid}`)
        // should be a single menu here, but its better to be safe than sorry
        for (const promise of menus.splice(0)) {
            promise.then((menu) => menu?.destroy())
                .catch(logException)
        }
    }

    return { enable, disable }
}
