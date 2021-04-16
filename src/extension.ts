const { GLib, St } = imports.gi
const Main = imports.ui.main
const { Button } = imports.ui.panelMenu
const { PopupSwitchMenuItem } = imports.ui.popupMenu

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()
const { exec, registerClass } = Me.imports.utils


/**
 * Prepare scroll lock for keyboard backlight control.
 */
function prepareScrollLock() {
    exec('/usr/bin/xmodmap', '-e', 'add mod3 = Scroll_Lock')
}

/**
 * Switch backlight to given state.
 *
 * @param {boolean} state
 */
function switchBacklight(state: boolean) {
    const op = state? 'led' : '-led'
    exec('/usr/bin/xset', op, 'named', 'Scroll Lock')
}

const BacklightMenu = registerClass(class BacklightMenu extends Button {
        popup?: InstanceType<typeof PopupSwitchMenuItem>

        /**
         * Constructor.
         */
        // @ts-ignore
        _init(name: string = Me.metadata.name) {
            super._init(0.0, name, false)

            this.addIconBox()
            this.addSwitchPopup()
        }

        /**
         * Create icon box for top panel.
         */
        addIconBox() {
            const box = new St.BoxLayout()
            box.add_actor(new St.Icon({
                icon_name: 'system-run-symbolic',
                style_class: 'system-status-icon'
            }))

            this.add_child(box)
        }

        /**
         * Create popup with a switch that turn on or off
         * at every toggle.
         */
        addSwitchPopup(initialState: boolean = false) {
            this.popup = new PopupSwitchMenuItem(
                'Backlight',
                initialState,
                { reactive: true }
            )
            this.popup.connect('toggled', (_, state) => {
                switchBacklight(state)
            })
            this.menu!.addMenuItem(this.popup)

            switchBacklight(initialState)
        }

        /**
         * Switch keyboard on or off.
         */
        switch(state: boolean) {
            this.popup!.setToggleState(state)
            switchBacklight(state)
        }
})

class BacklightExtension {
    initialState: boolean
    indicator: InstanceType<typeof BacklightMenu> | null

    /**
     * Constructor.
     */
    constructor(initialState: boolean = false) {
        this.initialState = initialState
        this.indicator = null
    }

    /**
     * Enable extension.
     */
    enable(name: string = 'backlight-keyboard') {
        prepareScrollLock()

        this.indicator = new BacklightMenu()
        Main.panel.addToStatusArea(name, this.indicator)

        this.switch(this.initialState)
    }

    /**
     * Disable extension.
     */
    disable() {
        this.indicator!.destroy()
        this.indicator = null
    }

    /**
     * Switch keyboard on or off.
     */
    switch(state: boolean) {
        this.indicator?.switch(state)
    }
}

function init() {
    return new BacklightExtension(true)
}
