import GLib from 'gi://GLib'

/** Represents a program that could not be found in `PATH`. */
export class PathError extends Error {
    /** The searched program. */
    readonly program: string

    /**
     * @param program The searched program.
     */
    constructor(program: string) {
        super(`could not find '${program}' in PATH`)
        this.program = program
    }

    override toString(this: this): string {
        return `${this.constructor.name}(program='${this.program}')`
    }
}

/**
 * Find a given program in `PATH`.
 *
 * @param program A string to be searched in `PATH`.
 * @returns The full path for this program.
 * @throws {PathError} if the program could not be found.
 */
export function findInPath(program: string): string {
    const path = GLib.find_program_in_path(program)
    if (!path) {
        throw new PathError(program)
    }
    return path
}
