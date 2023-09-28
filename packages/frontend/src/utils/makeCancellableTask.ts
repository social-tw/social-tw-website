type PromiseFunction = (...args: any[]) => Promise<unknown>

export type CancellableTaskFunction = (
    runner: CancellableTaskRunner
) => PromiseFunction | Promise<unknown>

export interface CancellableTaskOption {
    onCancellableChange?: (isCancellable: boolean) => void
    onCancel?: () => void
    onReset?: () => void
}

export interface CancellableState {
    isCancellable: boolean
    isCancelled: boolean
}

export interface CancellableTaskRunner {
    state: CancellableState
    setCancellable: (isCancellable: boolean) => void
    run: <T>(promise: Promise<T>) => Promise<T>
}

export interface CancellableTaskReturn {
    task: PromiseFunction
    cancel: () => void
    reset: () => void
    state: CancellableState
}

export class CancelledTaskError extends Error {
    constructor() {
        super()
        this.name = 'CancelledTaskError'
    }
}

export class CannotCancelError extends Error {
    constructor() {
        super()
        this.name = 'CannotCancelError'
    }
}

export default function makeCancellableTask(
    fn: CancellableTaskFunction,
    options?: CancellableTaskOption
): CancellableTaskReturn {
    const { onCancellableChange, onCancel, onReset } = options ?? {}

    const state: CancellableState = {
        isCancellable: true,
        isCancelled: false,
    }

    const runner: CancellableTaskRunner = {
        state,
        setCancellable: (_isCancellable) => {
            state.isCancellable = _isCancellable
            onCancellableChange?.(_isCancellable)
        },
        run: async (fn) => {
            if (state.isCancelled) throw new CancelledTaskError()

            const res = await fn
            if (state.isCancelled) {
                throw new CancelledTaskError()
            } else {
                return res
            }
        },
    }

    return {
        task: async (...args) => {
            const res = await fn(runner)
            return res instanceof Function ? res(...args) : res
        },
        cancel: () => {
            if (state.isCancellable) {
                state.isCancelled = true
                onCancel?.()
            } else {
                throw new CannotCancelError()
            }
        },
        reset: () => {
            if (state.isCancelled) {
                state.isCancellable = true
                state.isCancelled = false
                onReset?.()
            }
        },
        state,
    }
}
