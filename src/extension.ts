type Awaitable<T> = T | Promise<T>

interface ExtensionLike {
    enable(): Awaitable<void>
    disable(): Awaitable<void>
}

class AsyncExtension {
    private readonly errorQueue: unknown[] = []
    private readonly extension?: Promise<ExtensionLike | undefined>

    constructor(load: () => Promise<ExtensionLike>) {
        this.extension = this.storingErrors(load)
    }

    private async storingErrors<T>(run: () => T): Promise<Awaited<T> | undefined> {
        try {
            return await run()
        } catch (error) {
            this.errorQueue.push(error)
            return undefined
        }
    }

    private runOrThrow(block: (extension: ExtensionLike) => Awaitable<void>) {
        const error = this.errorQueue.pop()
        if (error) {
            throw error
        }

        this.storingErrors(async () => {
            const extension = await this.extension
            if (extension) {
                await block(extension)
            }
        })
    }

    enable() {
        this.runOrThrow((extension) => extension.enable())
    }

    disable() {
        this.runOrThrow((extension) => extension.disable())
    }
}

export function init() {
    return new AsyncExtension(async () => {
        const { BacklightExtension } = await import('./index.js')
        return new BacklightExtension()
    })
}
