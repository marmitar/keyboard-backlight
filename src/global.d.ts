import * as gjs from './gjs'

declare global {
    export function log<T extends { toString(): string }>(msg: T): void

    export const imports: typeof gjs.imports
}
