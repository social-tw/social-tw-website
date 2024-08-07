import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface DialogState {
    forbidAction: boolean
}

const initialState: DialogState = {
    forbidAction: false,
}

export const useDialogStore = create<DialogState>()(immer(() => initialState))

export function openForbidActionDialog() {
    useDialogStore.setState({ forbidAction: true })
}

export function closeForbidActionDialog() {
    useDialogStore.setState({ forbidAction: false })
}
