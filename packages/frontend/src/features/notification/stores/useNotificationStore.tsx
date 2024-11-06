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

const initialState = {
    notifications: [] as Notification[],
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    ...initialState,
    addNotification: (notification) =>
        set((state) => {
            // Check if notification with same ID already exists
            if (state.notifications.some((n) => n.id === notification.id)) {
                return state // Return unchanged state if ID exists
            }
            return {
                notifications: [...state.notifications, notification],
            }
        }),
    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            ),
        })),
    loadReadStatuses: () => {
        const storedNotifications = localStorage.getItem('notifications')
        if (storedNotifications) {
            set({ notifications: JSON.parse(storedNotifications) })
        } else {
            set({ notifications: [] })
        }
    },
    reset: () => set({ ...initialState }),
}))


//usage:

//import { useNotificationStore } from '@/features/notification/stores/useNotificationStore'

// NotificationService.sendNotification('SIGN_UP_SUCCESS')

// const clearNotifications = () => {
//     const resetStore = useNotificationStore((state) => state.reset)
//     resetStore()
// }