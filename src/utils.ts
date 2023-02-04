import { GLib } from './gjs/gi.js'

type NonEmpty<T> = [T, ...T[]]

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
 * Converts `Uint8Array` to `String`.
 */
const decoder = new TextDecoder('utf-8')

/**
 * Call program with given arguments.
 */
export function exec(...args: NonEmpty<string>) {
    const cmd = args.map(arg => `'${arg}'`).join(' ')

    const [ok, bufout, buferr, exitCode] = GLib.spawn_command_line_sync(cmd)

    const stdout = decoder.decode(bufout ?? undefined)
    const stderr = decoder.decode(buferr ?? undefined)

    if (!ok || exitCode !== 0) {
        // unsuccesfull execution
        throw new ExecError(exitCode, stdout, stderr)
    }

    return { stdout, stderr }
}
