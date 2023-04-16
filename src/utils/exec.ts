import { Gio } from '../gjs/gi.js'
import type { Subprocess } from '@gi-types/gio'

/** Represents a command line to be invoked. */
export type Command = readonly [program: string, ...args: readonly string[]]

/** Represents a unsuccessful invocation of an external program. */
export class ExecError extends Error {
    /** The results of the invoked process. */
    readonly proc: Subprocess
    /** The command used to start the process. */
    readonly command: Command
    /** The normal output of the program. */
    readonly stdout: string | null
    /** The error output of the program. */
    readonly stderr: string | null

    /** The exit status returned by the program invocation. */
    get exitCode(): number {
        if (this.proc.get_if_exited()) {
            return this.proc.get_exit_status()
        } else {
            return this.proc.get_status()
        }
    }

    /**
     * @param proc The results of the invoked process.
     * @param command The command used to start the process.
     * @param stdout The normal output of the program.
     * @param stderr The error output of the program.
     */
    constructor(proc: Subprocess, command: Command, stdout: string | null, stderr: string | null) {
        super(`process '${command.join(' ')}' exited with status ${proc.get_exit_status()}`)
        this.proc = proc
        this.command = command
        this.stdout = stdout
        this.stderr = stderr
    }

    override toString(this: this): string {
        return `${this.constructor.name}(`
            + `command=${this.command.join(' ')},`
            + ` exitCode=${this.exitCode},`
            + ` stdout="${this.stdout}",`
            + ` stderr="${this.stderr}"`
            + ')'
    }
}

/** Object that spawns processes and captures their `STDOUT` and `STDERR`. */
const launcher = new Gio.SubprocessLauncher({
    flags: Gio.SubprocessFlags.STDOUT_PIPE
        | Gio.SubprocessFlags.STDERR_PIPE
})

/**
 * Promisified version of {@link Subprocess.communicate_utf8_async}.
 *
 * @param proc The spawned process.
 * @returns A promise that resolves with {@link proc}'s `STDOUT` and `STDERR`.
 */
function communicate_utf8(proc: Subprocess): Promise<[stdout: string | null, stderr: string | null]> {
    return new Promise((resolve, reject) => {
        proc.communicate_utf8_async(null, null, (_, result) => {
            try {
                const [_, stdout, stderr] = proc.communicate_utf8_finish(result)
                resolve([stdout, stderr])
            } catch (error) {
                reject(error)
            }
        })
    })
}

/**
 * Execute a program and return its `STDOUT`.
 *
 * @param command The command line to be executed.
 * @returns The contents captured in `STDOUT`.
 * @throws {ExecError} if the process ended with a non-zero exit status.
 */
export async function exec(...command: Command): Promise<string> {
    const proc = launcher.spawnv([...command])
    const [stdout, stderr] = await communicate_utf8(proc)

    if (!proc.get_successful()) {
        throw new ExecError(proc, command, stdout, stderr)
    }
    // log execution warnings for further inspection
    if (stderr) {
        log(`${command.join(' ')}: ${stderr}`)
    }
    return stdout ?? ''
}
