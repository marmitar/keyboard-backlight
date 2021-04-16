import * as gjs from './gjs'

declare global {
    export function log(msg: string): void

    export const imports: typeof gjs.imports
}
