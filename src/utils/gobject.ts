/** An object that works like a tree node. */
export interface GObjectLike {
    /** Remove the object resources. */
    destroy(this: this): void
    /** Get the object's parent in the tree. */
    get_parent(this: this): GObjectLike | null | undefined
    /** Get the object's children in the tree. */
    get_children(this: this): readonly GObjectLike[]
    /** Remove a child from this subtree. */
    remove_child(this: this, child: GObjectLike): void
}

/** Represents a node that has already been destroyed via {@link GObjectLike.destroy}. */
export class GObjectDestroyedError extends Error {
    /**
     * @param gobject The tree node that triggered the error.
     */
    constructor(readonly gobject: GObjectLike) {
        super(`node ${gobject} has already been destroyed`)
    }

    override toString(this: this): string {
        return `${this.constructor.name}(node=${this.gobject})`
    }
}

/** Set of all nodes destroyed via {@link Node.destroy}. */
const DESTROYED = new WeakSet<GObjectLike>()

/** Disconnects `gobject` from its parent in the tree structure. */
function makeOrphan(gobject: GObjectLike): void {
    gobject.get_parent()?.remove_child(gobject)
}

/**
 * Destroys a subtree of `GObject`. Also marks nodes as destroyed, to avoid double-free problems.
 *
 * @param gobject Root of the subtree to be destroyed.
 */
export function destroySubTree(gobject: GObjectLike): void {
    if (DESTROYED.has(gobject)) {
        throw new GObjectDestroyedError(gobject)
    }

    const children = [...gobject.get_children()]
    children.forEach(destroySubTree)

    // the node could have been destroyed as one of its children if a cycle is (wrongly) present
    if (DESTROYED.has(gobject)) {
        throw new GObjectDestroyedError(gobject)
    }

    makeOrphan(gobject)
    gobject.destroy()
    DESTROYED.add(gobject)
}
