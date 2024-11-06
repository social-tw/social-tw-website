import { create } from 'zustand'

interface Notification {
    id: number
    type: string
    message: string
    time: string
    isRead: boolean
    actions?: NotificationAction[]
}

interface NotificationAction {
    label: string
    execute: () => void
}

interface NotificationStore {
    notifications: Notification[]
    addNotification: (notification: Notification) => void
    markAsRead: (id: number) => void
    loadReadStatuses: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        set((state) => {
            const updatedNotifications = [...state.notifications, notification]
            // Save the notifications to local storage
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
            return { notifications: updatedNotifications }
        })
    },
    markAsRead: (id) => {
        set((state) => {
            const updatedNotifications = state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
            // Save updated read statuses to local storage
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
            return { notifications: updatedNotifications }
        })
    },
    loadReadStatuses: () => {
        // Load notifications from local storage if available
        const storedNotifications = localStorage.getItem('notifications')
        if (storedNotifications) {
            set({ notifications: JSON.parse(storedNotifications) })
        }
    },
}))
