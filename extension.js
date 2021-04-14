const { GObject, St, GLib } = imports.gi
const Main = imports.ui.main
const Mainloop = imports.mainloop
const { Button } = imports.ui.panelMenu
const { PopupSwitchMenuItem } = imports.ui.popupMenu

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()


/**
 * Converts `ByteArray` into `String`.
 *
 * @param {ByteArray} array
 * @returns {string}
 */
function ByteArrayToString(array) {
    return String.fromCharCode.apply(String, array)
}

/**
 * Call program with given arguments.
 *
 * @param {string} program
 * @param  {...string} args
 * @returns {string}
 */
function call(program, ...args) {
    const arguments = args.map(arg => "'" + arg + "'")
    const cmd = [program, ...arguments].join(' ')

    const [ok, bufout, buferr, exitCode] = GLib.spawn_command_line_sync(cmd)
    const stdout = ByteArrayToString(bufout)

    if (! ok) {
        // unsuccesfull execution
        const stderr = ByteArrayToString(buferr)
        throw new Error(`exitCode=${exitCode}, stdout="${stdout}", stderr="${stderr}"`)
    }
    return stdout
}

/**
 * Prepare scroll lock for keyboard backlight control.
 */
function prepareScrollLock() {
    call('/usr/bin/xmodmap', '-e', 'add mod3 = Scroll_Lock')
}

/**
 * Switch backlight to given state.
 *
 * @param {boolean} state
 */
function switchBacklight(state) {
    const op = state? 'led' : '-led'
    call('/usr/bin/xset', op, 'named', 'Scroll Lock')
}

const BacklightMenu = GObject.registerClass({
    GTypeName: 'BacklightMenu'
}, class BacklightMenu extends Button {
    /**
     * Constructor.
     *
     * @param {string} name
     */
    _init(name = Me.metadata.name) {
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

        this.actor.add_child(box)
    }

    /**
     * Create popup with a switch that turn on or off
     * at every toggle.
     *
     * @param {boolean} initialState
     */
    addSwitchPopup(initialState = false) {
        this.popup = new PopupSwitchMenuItem(
            'Backlight',
            initialState,
            { reactive: true }
        )
        this.popup.connect('toggled', (_, state) => {
            switchBacklight(state)
        })
        this.menu.addMenuItem(this.popup)

        switchBacklight(initialState)
    }

    /**
     * Switch keyboard on or off.
     *
     * @param {boolean} state
     */
    switch(state) {
        this.popup.setToggleState(state)
        switchBacklight(state)
    }
})

class BacklightExtension {
    /**
     * Constructor.
     *
     * @param {boolean} initialState
     */
    constructor(initialState = false) {
        this.initialState = initialState
    }

    /**
     * Enable extension.
     *
     * @param {string} name
     */
    enable(name = 'backlight-keyboard') {
        prepareScrollLock()

        this.indicator = new BacklightMenu()
        Main.panel.addToStatusArea(name, this.indicator)


        this.switch(this.initialState)
    }

    /**
     * Disable extension.
     */
    disable() {
        this.indicator.destroy()
        this.indicator = null
    }

    /**
     * Switch keyboard on or off.
     *
     * @param {boolean} state
     * @param {number} after - Wait time in seconds
     */
    switch(state, after = 0) {
        if (!this.indicator) {
            return
        } else if (after <= 0) {
            this.indicator.switch(state)
        } else {
            const mtime = Math.round(1000 * after)

            GLib.timeout_add(GLib.PRIORITY_DEFAULT, mtime, () => {
                log('[BacklightExtension]: timeout!', state)

                this.switch(state)
                return GLib.SOURCE_REMOVE
            })
        }
    }
}

function init() {
    return new BacklightExtension(true)
}
