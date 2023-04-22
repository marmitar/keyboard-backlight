/** A {@link PropertyDescriptor} that describes a read-only property.  */
export interface ReadOnlyPropertyDescriptor {
    /** If this property shows up during enumeration of the properties on the corresponding object. */
    readonly enumerable: boolean
    /** Read-only properties should be non-configurable. */
    readonly configurable: false
    /** Read-only properties must not be writeable. */
    readonly writable: false
}

/** A read-only {@link PropertyDescriptor} with an assigned value. */
export interface ReadOnlyPropertyValue<T> extends ReadOnlyPropertyDescriptor {
    /** The value for this property. */
    readonly value: T
}

/** A read-only {@link PropertyDescriptor} with a getter method. */
export interface ReadOnlyPropertyGetter<T> extends ReadOnlyPropertyDescriptor {
    /** The getter for this property. */
    get(): T
}

/** A read-only {@link PropertyDescriptor}. */
export type ReadOnlyProperty<T> = ReadOnlyPropertyValue<T> | ReadOnlyPropertyGetter<T>

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
