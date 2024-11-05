import create from 'zustand'

interface Notification {
    id: number
    message: string
    time: string
    isRead: boolean
    actionLabel?: string
    action?: () => void
}

interface NotificationStore {
    notifications: Notification[]
    addNotification: (notification: Notification) => void
    markAsRead: (id: number) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) =>
        set((state) => ({
            notifications: [...state.notifications, notification],
        })),
    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            ),
        })),
}))
