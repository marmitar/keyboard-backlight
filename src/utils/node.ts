/** Represents a node that has already been destroyed via {@link Node.destroy}. */
export class NodeDestroyedError extends Error {
    /** The tree node that triggered the error. */
    readonly node: Node

    /**
     * @param node The tree node that triggered the error.
     */
    constructor(node: Node) {
        super(`node ${node} has already been destroyed`)
        this.node = node
    }

    override toString(this: this): string {
        return `${this.constructor.name}(node=${this.node})`
    }
}

/** Clones an array. */
function clone<const T>(array: readonly T[]): T[] {
    return array.map((item) => item)
}

/** An object that works like a tree node. */
export interface Node {
    /** Remove the object resources. */
    destroy(this: this): void
    /** Get the object's parent in the tree. */
    get_parent(this: this): Node | null | undefined
    /** Get the object's children in the tree. */
    get_children(this: this): readonly Node[]
    /** Remove a child from this subtree. */
    remove_child(this: this, child: Node): void
}

export namespace Node {
    /** Set of all nodes destroyed via {@link Node.destroy}. */
    const DESTROYED = new WeakSet<Node>()

    /** Throws an error if the node has already been inserted in {@link DESTROYED}. */
    function assertNotDestroyed(node: Node): void {
        if (DESTROYED.has(node)) {
            throw new NodeDestroyedError(node)
        }
    }

    /** Disconnects `node` from its parent in the tree structure. */
    function makeOrphan(node: Node): void {
        node.get_parent()?.remove_child(node)
    }

    /**
     * Destroys a subtree starting at `node`. Also marks nodes as destroyed, to avoid double-free problems.
     *
     * @param node Root of the subtree to be destroyed.
     */
    export function destroy(node: Node): void {
        assertNotDestroyed(node)
        const children = clone(node.get_children())
        children.forEach(destroy)

        // the node could have been destroyed as one of its children if a cycle is (wrongly) present
        assertNotDestroyed(node)
        makeOrphan(node)
        node.destroy()
        DESTROYED.add(node)
    }
}
