import { create } from 'zustand'
import { NotificationAction } from '../types/NotificationTypes'
import { Notification } from '../types/NotificationTypes'



interface NotificationStore {
    notifications: Notification[]
    showNotificationDot: boolean
    addNotification: (notification: Notification) => void
    markAsRead: (id: number) => void
    loadNotifications: () => void
    reset: () => void
    clearNotificationDot: () => void
}

// Define initial state
const initialState = {
    notifications: [] as Notification[],
    showNotificationDot: false,
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    ...initialState,
    addNotification: (notification) =>
        set((state) => {
            const updatedNotifications = [...state.notifications, notification]
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
            return {
                notifications: updatedNotifications,
                showNotificationDot: true,
            }
        }),
    markAsRead: (id) =>
        set((state) => {
            const updatedNotifications = state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
            return { notifications: updatedNotifications }
        }),
    loadNotifications: () => {
        const storedNotifications = localStorage.getItem('notifications')
        if (storedNotifications) {
            set({ notifications: JSON.parse(storedNotifications) })
        }
    },
    reset: () => {
        localStorage.removeItem('notifications')
        set({ ...initialState })
    },
    clearNotificationDot: () => set({ showNotificationDot: false }),
}))

// Load stored notifications upon initializing
useNotificationStore.getState().loadNotifications()
