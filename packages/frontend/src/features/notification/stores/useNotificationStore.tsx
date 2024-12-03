import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
interface Notification {
    id: number
    type: string
    message: string
    time: string
    isRead: boolean
    targetId?: string
}

interface NotificationStore {
    notifications: Notification[]
    showNotificationDot: boolean
    addNotification: (notification: Notification) => void
    markAsRead: (id: number) => void
    reset: () => void
    clearNotificationDot: () => void
}

const initialState = {
    notifications: [] as Notification[],
    showNotificationDot: false,
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            addNotification: (notification) =>
                set((state) => ({
                    notifications: [...state.notifications, notification],
                    showNotificationDot: true,
                })),
            markAsRead: (id) =>
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, isRead: true } : n
                    ),
                })),
            reset: () => set({ ...initialState }),
            clearNotificationDot: () => set({ showNotificationDot: false }),
        }),
        {
            name: 'notifications-storage',
            storage: createJSONStorage(() => localStorage), 
        }
    )
)