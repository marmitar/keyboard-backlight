import type { RegisteredClass, ParamSpec, ParamSpecBoolean, GType } from '@gi-types/gobject'

export type Constructor<T = {}> = new(...args: any[]) => any

export type ParamSpecs = { [key: string]: ParamSpec }
export type BooleanProps<K extends string> = { [key in K]: ParamSpecBoolean }

export type GObject<T = any> = { $gtype: GType<T> }
export type Interfaces = GObject[]

export type ProblematicKeys = '_init' | 'connect_after' | 'container'
export type Sanitized<T extends Constructor>
    = new (...args: ConstructorParameters<T>) => Omit<InstanceType<T>, ProblematicKeys>

export type Registered<T extends Constructor, P extends ParamSpecs = {}, I extends Interfaces = []>
    = Sanitized<RegisteredClass<T, P, I>>
