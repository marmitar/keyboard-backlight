import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import { BacklightMenu } from './menu.js'

export default class BacklightExtension extends Extension {
    #menu: BacklightMenu | undefined

    override enable(this: this) {
        log(`Enabling ${this.metadata.uuid}`)

        this.#menu?.destroy()
        this.#menu = undefined

        this.#menu = new BacklightMenu(this.metadata)
    }

    override disable(this: this) {
        log(`Disabling ${this.metadata.uuid}`)

        this.#menu?.destroy()
        this.#menu = undefined
    }
}
