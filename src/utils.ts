import { GLib } from './gjs/gi.js'

/**
 * Converts `Uint8Array` to `String`.
 */
function byteArrayToString(array: Uint8Array | null): string {
    return String.fromCharCode(...array ?? [])
}

/**
 * Command line execution error.
 */
class ExecError {
    code: number
    out: string
    err: string

    constructor(code: number | null, out: string, err: string) {
        this.code = code ?? -1
        this.out = out
        this.err = err
    }

    toString(): string {
        return `exitCode=${this.code},`
            + ` stdout="${this.out}",`
            + ` stderr="${this.err}"`
    }
}

/**
 * Call program with given arguments.
 */
export function exec(program: string, ...args: string[]) {
    const pargs = args.map(arg => "'" + arg + "'")
    const cmd = [program, ...pargs].join(' ')

    const [ok, bufout, buferr, exitCode] = GLib.spawn_command_line_sync(cmd)

    const stdout = byteArrayToString(bufout)
    const stderr = byteArrayToString(buferr)

    if (!ok || exitCode !== 0) {
        // unsuccesfull execution
        throw new ExecError(exitCode, stdout, stderr)
    }

    return { stdout, stderr }
}
