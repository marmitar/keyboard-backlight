import { Instance, Registered, St } from '../register'
import { Button } from './panelMenu'


class _Panel extends St.Widget {
    _init(): void
    toggleAppMenu(): void
    toggleCalendar(): void
    closeCalendar(): void
    set boxOpacity(value: number)
    get boxOpacity(): number
    addToStatusArea<T extends Instance<typeof Button>>(
        role: string,
        indicator: T,
        position?: number,
        box?: 'left' | 'center' | 'right'
    ): T
}
export const Panel: Registered<typeof _Panel>
