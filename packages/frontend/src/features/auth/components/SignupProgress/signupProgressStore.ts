import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface SignupProgressState {
    value: number
    max: number
    isPaused: boolean
}

const initialState: SignupProgressState = {
    value: 0,
    max: 20,
    isPaused: false,
}

const slot = 1000 // 1 second

export const useSignupProgressStore = create<SignupProgressState>()(
    immer(() => initialState),
)

export function startSignupProgress() {
    const { isPaused } = useSignupProgressStore.getState()
    if (isPaused) return

    useSignupProgressStore.setState((state) => {
        state.value++
    })

    setTimeout(() => {
        startSignupProgress()
    }, slot)
}

export function pauseSignupProgress() {
    useSignupProgressStore.setState({
        isPaused: true,
    })
}

export function continueSignupProgress() {
    useSignupProgressStore.setState({
        isPaused: false,
    })
    startSignupProgress()
}

export function resetSignupProgress() {
    pauseSignupProgress()
    setTimeout(() => {
        useSignupProgressStore.setState(initialState)
    }, slot)
}
