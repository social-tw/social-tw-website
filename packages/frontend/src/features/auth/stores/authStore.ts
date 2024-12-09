import create from 'zustand'

type AuthStore = {
    errorMessage: string | null
    setErrorMessage: (message: string | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    errorMessage: null,
    setErrorMessage: (message) => set({ errorMessage: message }),
}))
