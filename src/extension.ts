import type { Menu } from './menu.js'

export function init(meta: typeof import('./metadata.json')) {
    // prefix used in exception logs
    const [extesionTag] = meta.uuid.split('@')

    function logException(exception: unknown) {
        log(`${extesionTag}: ${exception}`)
        if (exception instanceof Error) {
            logError(exception, extesionTag)
        }
    }

    // dynamic imports are the only way to use 'import' in GJS
    const menuModule = import('./menu.js')
    // if 'enable' is called more than once, we need to store all the menus here
    const menus: Promise<Menu | void>[]  = []

    function enable() {
        log(`${meta.uuid}: enabling`)

        const menu = menuModule
            .then(({ addBacklightMenu }) => addBacklightMenu(meta.name, meta.uuid))
            .catch(logException)

        menus.push(menu)
    }

    function disable() {
        log(`${meta.uuid}: disabling`)
        // destroy all menus (should be a single menu here)
        for (const promise of menus.splice(0)) {
            promise.then((menu) => menu?.destroy())
                .catch(logException)
        }
    }

    return { enable, disable }
}
