/** A {@link PropertyDescriptor} that describes a read-only property.  */
export interface ReadOnlyPropertyDescriptor {
    /** Read-only properties are better of as enumerable. */
    readonly enumerable: true
    /** Read-only properties should be non-configurable. */
    readonly configurable: false
}

/** A read-only {@link PropertyDescriptor} with an assigned value. */
export interface ReadOnlyDataProperty<T> extends ReadOnlyPropertyDescriptor {
    /** The value for this property. */
    readonly value: T
    /** Read-only properties must not be writeable. */
    readonly writable: false
}

/** A read-only {@link PropertyDescriptor} with a getter method. */
export interface ReadOnlyAccessorProperty<T> extends ReadOnlyPropertyDescriptor {
    /** The getter for this property. */
    get(): T
    /** Must not have a setter. */
    readonly set?: never
    /** The getter already prohibits write. */
    readonly writable?: never
}

/** A read-only {@link PropertyDescriptor}. */
export type ReadOnlyProperty<T> = ReadOnlyDataProperty<T> | ReadOnlyAccessorProperty<T>

/** A read-only {@link PropertyDescriptorMap}. */
export interface ReadOnlyPropertyDescriptorMap {
    readonly [_: string | symbol]: ReadOnlyProperty<any> & ThisType<any>
}

/** A read-only object built from its properties descriptors. */
export type ReadOnlyObject<M extends ReadOnlyPropertyDescriptorMap> = {
    readonly [P in keyof M]: M[P] extends ReadOnlyProperty<infer V> ? V : never
}

/** Functions for manipulating {@link Object}s. */
export namespace Objects {
    /**
     * Type-safe wrapper around {@link Object.create} for read-only objects. Creates a new object, using a record of
     * property descriptors to build the new object, then {@link Object.freeze}s it. The prototype is set to `null`.
     *
     * @param properties Description of the properties of the new object.
     * @returns The newly created frozen object.
     */
    export function create<const M extends ReadOnlyPropertyDescriptorMap>(properties: M): ReadOnlyObject<M> {
        return Object.freeze<ReadOnlyObject<M>>(Object.create(null, properties))
    }
}
