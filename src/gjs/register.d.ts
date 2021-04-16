export * as St from '@gi-types/st'
import { RegisteredClass, ParamSpec, ParamSpecBoolean, GType } from '@gi-types/gobject'


export type Object<T = any> = { $gtype: GType<T> }

export type Constructor<T = {}> = { new(...args: any[]): T, $gtype: GType }

export type ParamSpecs = { [key: string]: ParamSpec }

export type Interfaces = Object[]


export type Registered<T extends Constructor, P extends ParamSpecs = {}, I extends Interfaces = []> = RegisteredClass<T, P, I>

export type BooleanProps<K extends string> = { [key in K]: ParamSpecBoolean }


type HasThis<T> = T | ((...args: any[]) => T)

type PropertyThis<T> = ({ [K in keyof T]: T[K] extends HasThis<T> ? K : never })[keyof T]

export type OmitThis<T> = Omit<T, PropertyThis<T>>

type ProblematicKeys = '_init' | 'connect' | 'connect_after' | 'container'

export type Instance<T extends new(...ags: any[]) => any> = Omit<OmitThis<InstanceType<T>>, ProblematicKeys>
