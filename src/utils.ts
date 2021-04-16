import type { Registered, Constructor } from './gjs/register'
import type { byteArray as ByteArray } from './gjs/imports'
const { GLib, GObject } = imports.gi

/**
 * Converts `ByteArray` into `String`.
 */
function ByteArrayToString(array: ByteArray | null): string {
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

    const stdout = ByteArrayToString(bufout)
    const stderr = ByteArrayToString(buferr)

    if (!ok || exitCode !== 0) {
        // unsuccesfull execution
        throw new ExecError(exitCode, stdout, stderr)
    }

    return { stdout, stderr }
}

/**
 * Register class as GObject.
 */
export function registerClass<Class extends Constructor>(target: Class): Registered<Class> {
    return GObject.registerClass({ GTypeName: target.name }, target)
}
